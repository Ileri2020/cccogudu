import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const pageSize = 500;
const outputPath = fileURLToPath(new URL("../cloudinary-videos.json", import.meta.url));

function parseCloudinaryUrl() {
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

function getConfiguredAccounts() {
  const urlCredentials = parseCloudinaryUrl();
  const defaultAccount = {
    label: "default",
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
  const accounts = [];
  const missingCloudNames = [];

  if (defaultAccount.cloudName && defaultAccount.apiKey && defaultAccount.apiSecret) {
    accounts.push(defaultAccount);
  }

  for (let index = 1; index <= 7; index += 1) {
    const apiKey = process.env[`CLOUDINARY_API_KEY${index}`];
    const apiSecret = process.env[`CLOUDINARY_API_SECRET${index}`];
    if (!apiKey || !apiSecret) continue;

    const cloudName = process.env[`CLOUDINARY_CLOUD_NAME${index}`];
    if (!cloudName) {
      missingCloudNames.push(`CLOUDINARY_CLOUD_NAME${index}`);
      continue;
    }

    accounts.push({ label: `account-${index}`, cloudName, apiKey, apiSecret });
  }

  const uniqueAccounts = new Map();
  for (const account of accounts) {
    uniqueAccounts.set(`${account.cloudName}:${account.apiKey}`, account);
  }

  return { accounts: [...uniqueAccounts.values()], missingCloudNames };
}

function classify(resource) {
  const publicId = resource.public_id || "";
  const parentFolder = resource.asset_folder || publicId.split("/").slice(0, -1).join("/");
  const displayName = resource.display_name || publicId.split("/").at(-1) || "";
  const forUses = new Set();

  if (/worship/i.test(parentFolder)) forUses.add("worship");
  if (/praise/i.test(parentFolder)) forUses.add("praise");
  if (/\b(?:ccc|celestial|hymn)\b/i.test(displayName.replace(/[_-]+/g, " "))) {
    forUses.add("ccc");
  }

  return {
    ...resource,
    parentFolder,
    for: [...forUses],
  };
}

async function fetchAccountVideos(account) {
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

  return resources.map((resource) => ({
    ...classify(resource),
    cloudName: account.cloudName,
  }));
}

async function main() {
  const { accounts, missingCloudNames } = getConfiguredAccounts();
  if (missingCloudNames.length > 0) {
    throw new Error(
      `Cloud names are required to query these configured credential pairs: ${missingCloudNames.join(", ")}. Cloudinary does not expose a way to infer a cloud name from an API key and secret.`,
    );
  }
  if (accounts.length === 0) {
    throw new Error("No complete Cloudinary account credentials were found.");
  }

  const videos = [];
  const accountResults = [];
  for (const account of accounts) {
    try {
      const accountVideos = await fetchAccountVideos(account);
      videos.push(...accountVideos);
      accountResults.push({
        account: account.label,
        cloudName: account.cloudName,
        videos: accountVideos.length,
        status: "complete",
      });
      console.log(`Fetched ${accountVideos.length} videos from ${account.label}.`);
    } catch (error) {
      const message = error?.error?.message || error?.message || "Unknown error";
      accountResults.push({
        account: account.label,
        cloudName: account.cloudName,
        status: "failed",
        error: message,
      });
      console.error(`Could not fetch ${account.label}: ${message}`);
    }
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    accounts: accountResults,
    totalVideos: videos.length,
    videos,
  };
  await writeFile(outputPath, JSON.stringify(exportData, null, 2), "utf8");
  const failedAccounts = accountResults.filter((account) => account.status === "failed");
  console.log(`Saved ${videos.length} videos to ${path.basename(outputPath)}.`);
  if (failedAccounts.length > 0) {
    console.error(`${failedAccounts.length} account(s) failed; see the accounts status in the export.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = error?.error?.message || error?.message || "Unknown error";
  console.error("Cloudinary video export failed:", message);
  process.exitCode = 1;
});
