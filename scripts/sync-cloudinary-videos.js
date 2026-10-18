import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();
const ministryId = "684f74ca135dd6d0efeab37d";
const userId = "68771f546e4233fe08d0f1b0";
const pageSize = 500;

function readCloudinaryUrl() {
  const value = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_ENVIRONMENT_VARIABLE;
  if (!value) return null;

  try {
    const parsed = new URL(value.replace(/^CLOUDINARY_URL=/, ""));
    return {
      cloudName: parsed.hostname,
      apiKey: parsed.username,
      apiSecret: decodeURIComponent(parsed.password),
    };
  } catch {
    return null;
  }
}

function getAccounts() {
  const urlCredentials = readCloudinaryUrl();
  const defaultAccount = {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      urlCredentials?.cloudName,
    apiKey:
      process.env.CLOUDINARY_API_KEY ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      urlCredentials?.apiKey,
    apiSecret: process.env.CLOUDINARY_API_SECRET || urlCredentials?.apiSecret,
  };
  const candidates = [];

  if (defaultAccount.cloudName && defaultAccount.apiKey && defaultAccount.apiSecret) {
    candidates.push({ label: "default", ...defaultAccount });
  }

  for (let index = 1; index <= 6; index += 1) {
    const apiKey = process.env[`CLOUDINARY_API_KEY${index}`];
    const apiSecret = process.env[`CLOUDINARY_API_SECRET${index}`];
    if (!apiKey || !apiSecret) continue;

    candidates.push({
      label: `account-${index}`,
      cloudName:
        process.env[`CLOUDINARY_CLOUD_NAME${index}`] || defaultAccount.cloudName,
      apiKey,
      apiSecret,
    });
  }

  const uniqueAccounts = new Map();
  for (const account of candidates) {
    if (!account.cloudName) {
      throw new Error(`${account.label} is missing a Cloudinary cloud name.`);
    }
    uniqueAccounts.set(
      `${account.cloudName}:${account.apiKey}`,
      account,
    );
  }

  if (uniqueAccounts.size === 0) {
    throw new Error("No complete Cloudinary API credentials were found in the environment.");
  }

  return [...uniqueAccounts.values()];
}

async function fetchAllVideos(account) {
  cloudinary.config({
    cloud_name: account.cloudName,
    api_key: account.apiKey,
    api_secret: account.apiSecret,
  });

  const resources = [];
  let nextCursor;
  do {
    const result = await cloudinary.api.resources({
      resource_type: "video",
      type: "upload",
      max_results: pageSize,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`Fetched ${resources.length} videos from ${account.label}.`);
  return resources;
}

function normalizedUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.toLowerCase()}${parsed.pathname}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function classify(resource) {
  const publicId = resource.public_id || "";
  const folder = resource.asset_folder || publicId.split("/").slice(0, -1).join("/");
  const displayName = resource.display_name || publicId.split("/").at(-1) || "";
  const tags = new Set();

  if (/worship/i.test(folder)) tags.add("worship");
  if (/praise/i.test(folder)) tags.add("praise");
  if (/\b(?:ccc|celestial|hymn)\b/i.test(displayName.replace(/[_-]+/g, " "))) {
    tags.add("ccc");
  }

  return {
    tags: [...tags],
    title: displayName.replace(/[_-]+/g, " ").trim(),
    url: resource.secure_url || resource.url,
  };
}

async function normalizeExistingForValues() {
  await prisma.$runCommandRaw({
    update: "Post",
    updates: [
      {
        q: { for: { $not: { $type: "array" } } },
        u: [
          {
            $set: {
              for: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$for", "praisevideo"] }, then: ["praise"] },
                    { case: { $eq: ["$for", "worshipvideo"] }, then: ["worship"] },
                  ],
                  default: {
                    $cond: [
                      { $eq: [{ $type: "$for" }, "string"] },
                      ["$for"],
                      ["post"],
                    ],
                  },
                },
              },
            },
          },
        ],
        multi: true,
      },
    ],
  });
}

async function main() {
  const accounts = getAccounts();
  const resourcesByUrl = new Map();

  // Fetch from every configured key before writing, so a failed account cannot
  // silently result in an incomplete import.
  for (const account of accounts) {
    const resources = await fetchAllVideos(account);
    for (const resource of resources) {
      const classified = classify(resource);
      if (!classified.url) continue;

      const key = normalizedUrl(classified.url);
      const existing = resourcesByUrl.get(key);
      if (existing) {
        existing.for = [...new Set([...existing.for, ...classified.tags])];
      } else {
        resourcesByUrl.set(key, {
          ministryId,
          title: classified.title || resource.public_id || "Untitled video",
          description: "",
          for: classified.tags,
          url: classified.url,
          type: "video",
          userId,
          duration: "nill",
        });
      }
    }
  }

  await normalizeExistingForValues();

  const existingPosts = await prisma.post.findMany({
    where: { type: "video" },
    select: { id: true, url: true, for: true },
  });
  const existingByUrl = new Map(
    existingPosts.map((post) => [normalizedUrl(post.url), post]),
  );
  const toCreate = [];
  let updated = 0;

  for (const [urlKey, video] of resourcesByUrl) {
    const existing = existingByUrl.get(urlKey);
    if (!existing) {
      toCreate.push(video);
      continue;
    }

    const desiredTags = [...new Set(video.for)];
    const existingTags = Array.isArray(existing.for) ? existing.for : [];
    if (JSON.stringify([...existingTags].sort()) !== JSON.stringify([...desiredTags].sort())) {
      await prisma.post.update({
        where: { id: existing.id },
        data: { for: desiredTags },
      });
      updated += 1;
    }
  }

  for (let index = 0; index < toCreate.length; index += 500) {
    await prisma.post.createMany({ data: toCreate.slice(index, index + 500) });
  }

  console.log(
    `Sync complete: ${resourcesByUrl.size} unique Cloudinary videos checked, ${toCreate.length} created, ${updated} classifications updated.`,
  );
}

main()
  .catch((error) => {
    console.error("Cloudinary video sync failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
