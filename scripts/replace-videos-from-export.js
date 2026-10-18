import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const exportPath = path.join(projectRoot, "cloudinary-videos.json");
const backupDirectory = path.join(projectRoot, "data-backups");
const ministryId = "684f74ca135dd6d0efeab37d";
const userId = "68771f546e4233fe08d0f1b0";
const allowedTags = new Set(["worship", "praise", "ccc"]);
const chunkSize = 300;

function normalizedUrl(url) {
  const parsed = new URL(url);
  return `${parsed.hostname.toLowerCase()}${parsed.pathname}`.toLowerCase();
}

function buildPosts(exportData) {
  const postsByUrl = new Map();
  for (const resource of exportData.videos) {
    const url = resource.secure_url || resource.url;
    if (!url) throw new Error("An exported video has no URL.");

    const tags = Array.isArray(resource.for) ? resource.for : [];
    if (tags.some((tag) => !allowedTags.has(tag))) {
      throw new Error("The export contains a video category outside worship/praise/ccc.");
    }

    const key = normalizedUrl(url);
    const previous = postsByUrl.get(key);
    if (previous) {
      previous.for = [...new Set([...previous.for, ...tags])];
      continue;
    }

    const displayName = resource.display_name || resource.public_id || "Untitled video";
    postsByUrl.set(key, {
      ministryId,
      title: displayName.replace(/[_-]+/g, " ").trim(),
      description: "",
      for: [...new Set(tags)],
      url,
      type: "video",
      userId,
      duration: "nill",
    });
  }
  return [...postsByUrl.values()];
}

function printSummary({ exportData, targetPosts, existingPosts, related }) {
  const counts = {};
  for (const post of targetPosts) {
    for (const tag of post.for) counts[tag] = (counts[tag] || 0) + 1;
  }
  const failedAccounts = exportData.accounts.filter((account) => account.status !== "complete");
  console.log(JSON.stringify({
    mode: process.argv.includes("--commit") ? "commit" : "dry-run",
    sourceVideos: exportData.totalVideos,
    uniqueVideosToImport: targetPosts.length,
    existingVideoPostsToRemove: existingPosts.length,
    relatedCommentsToRemove: related.comments,
    relatedLikesToRemove: related.likes,
    playlistReferencesToClean: related.playlists,
    targetCategories: counts,
    incompleteAccounts: failedAccounts.map(({ account, cloudName, status, error }) => ({
      account,
      cloudName,
      status,
      error,
    })),
  }, null, 2));
}

async function createInChunks(model, records) {
  for (let index = 0; index < records.length; index += chunkSize) {
    await model.createMany({ data: records.slice(index, index + chunkSize) });
  }
}

async function findAllRaw(collection, filter) {
  const documents = [];
  let lastId;
  while (true) {
    const pageFilter = lastId
      ? { ...filter, _id: { $gt: { $oid: lastId } } }
      : filter;
    const result = await prisma.$runCommandRaw({
      find: collection,
      filter: pageFilter,
      sort: { _id: 1 },
      limit: chunkSize,
      batchSize: chunkSize,
    });
    const batch = result.cursor?.firstBatch || [];
    if (batch.length === 0) break;
    documents.push(...batch);
    lastId = objectIdValue(batch[batch.length - 1]._id);
    if (!lastId) throw new Error(`Could not page raw ${collection} documents by _id.`);
  }

  return documents;
}

function objectIdValue(value) {
  return typeof value === "string" ? value : value?.$oid;
}

async function restoreRawDocuments(collection, documents) {
  for (let index = 0; index < documents.length; index += chunkSize) {
    await prisma.$runCommandRaw({
      update: collection,
      updates: documents.slice(index, index + chunkSize).map((document) => ({
        q: { _id: document._id },
        u: document,
        upsert: true,
        multi: false,
      })),
    });
  }
}

async function main() {
  const isCommit = process.argv.includes("--commit");
  const allowIncomplete = process.argv.includes("--allow-incomplete");
  const exportData = JSON.parse(await readFile(exportPath, "utf8"));
  if (!Array.isArray(exportData.videos) || exportData.totalVideos !== exportData.videos.length) {
    throw new Error("The local Cloudinary export is missing videos or has an inconsistent count.");
  }

  const failedAccounts = exportData.accounts.filter((account) => account.status !== "complete");
  if (failedAccounts.length > 0 && !allowIncomplete) {
    throw new Error("The export has incomplete accounts. Pass --allow-incomplete only after reviewing the omitted accounts.");
  }

  const targetPosts = buildPosts(exportData);
  await prisma.$connect();
  const importUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!importUser) throw new Error("The configured import user does not exist; no database records were changed.");

  // Read raw Mongo documents because existing records may still contain the old
  // scalar `for` value even though the current Prisma schema expects String[].
  const existingPosts = await findAllRaw("Post", { type: "video" });
  const existingIds = existingPosts.map((post) => objectIdValue(post._id)).filter(Boolean);
  const objectIds = existingIds.map((_id) => ({ $oid: _id }));
  const [comments, likes, playlists] = existingIds.length === 0
    ? [[], [], []]
    : await Promise.all([
      findAllRaw("Comment", { contentId: { $in: objectIds } }),
      findAllRaw("Like", { contentId: { $in: objectIds } }),
      findAllRaw("Playlist", { postsId: { $in: objectIds } }),
    ]);

  const related = {
    comments: comments.length,
    likes: likes.length,
    playlists: playlists.length,
  };
  printSummary({ exportData, targetPosts, existingPosts, related });
  if (!isCommit) {
    console.log("Dry run only. No database records were changed. Rerun with --commit to replace video posts.");
    return;
  }

  await mkdir(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDirectory, `video-posts-before-sync-${timestamp}.json`);
  await writeFile(backupPath, JSON.stringify({
    backedUpAt: new Date().toISOString(),
    posts: existingPosts,
    comments,
    likes,
    playlists,
  }, null, 2));
  console.log(`Saved a local backup of the existing video records and related data (${path.basename(backupPath)}).`);

  try {
    if (existingIds.length > 0) {
      await prisma.comment.deleteMany({ where: { contentId: { in: existingIds } } });
      await prisma.like.deleteMany({ where: { contentId: { in: existingIds } } });
      await prisma.$runCommandRaw({
        update: "Playlist",
        updates: [{
          q: { postsId: { $in: objectIds } },
          u: { $pull: { postsId: { $in: objectIds } } },
          multi: true,
        }],
      });
      await prisma.$runCommandRaw({
        delete: "Post",
        deletes: [{ q: { _id: { $in: objectIds } }, limit: 0 }],
      });
    }

    await createInChunks(prisma.post, targetPosts);

    const finalCountResult = await prisma.$runCommandRaw({ count: "Post", query: { type: "video" } });
    if (finalCountResult.n !== targetPosts.length) {
      throw new Error(`Post-sync verification failed: expected ${targetPosts.length}, found ${finalCountResult.n}.`);
    }
  } catch (error) {
    console.error("Replacement failed; attempting to restore the prior video posts and related data from the backup.");
    try {
      const sourceUrls = targetPosts.map((post) => post.url);
      await prisma.$runCommandRaw({
        delete: "Post",
        deletes: [{ q: { type: "video", url: { $in: sourceUrls } }, limit: 0 }],
      });
      await restoreRawDocuments("Post", existingPosts);
      await restoreRawDocuments("Comment", comments);
      await restoreRawDocuments("Like", likes);
      for (const playlist of playlists) {
        await prisma.$runCommandRaw({
          update: "Playlist",
          updates: [{
            q: { _id: playlist._id },
            u: { $set: { postsId: playlist.postsId } },
            multi: false,
          }],
        });
      }
      console.error("Prior video records restored from the saved backup.");
    } catch {
      console.error(`Automatic restore did not complete. Use the backup at ${backupPath} to recover.`);
    }
    throw error;
  }

  const finalPosts = await findAllRaw("Post", { type: "video" });
  const finalCategories = {};
  for (const post of finalPosts) {
    const tags = Array.isArray(post.for) ? post.for : [];
    for (const tag of tags) finalCategories[tag] = (finalCategories[tag] || 0) + 1;
  }
  console.log(`Replacement complete and verified: ${finalPosts.length} video posts. Categories: ${JSON.stringify(finalCategories)}.`);
}

main()
  .catch((error) => {
    console.error("Video replacement failed:", error?.message || "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });