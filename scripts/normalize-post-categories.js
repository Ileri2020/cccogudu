import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const root = fileURLToPath(new URL("..", import.meta.url));
const backupDirectory = path.join(root, "data-backups");
const pageSize = 300;

async function findNonArrayCategoryPosts() {
  const documents = [];
  let lastId;

  while (true) {
    const filter = {
      for: { $not: { $type: "array" } },
      ...(lastId ? { _id: { $gt: { $oid: lastId } } } : {}),
    };
    const result = await prisma.$runCommandRaw({
      find: "Post",
      filter,
      sort: { _id: 1 },
      limit: pageSize,
      batchSize: pageSize,
    });
    const batch = result.cursor?.firstBatch || [];
    if (batch.length === 0) break;
    documents.push(...batch);
    lastId = batch[batch.length - 1]._id?.$oid;
    if (!lastId) throw new Error("Could not page legacy Post documents by ObjectId.");
  }

  return documents;
}

async function main() {
  const legacyPosts = await findNonArrayCategoryPosts();
  if (legacyPosts.length === 0) {
    console.log("All Post.for values are already arrays; no changes needed.");
    return;
  }

  await mkdir(backupDirectory, { recursive: true });
  const backupPath = path.join(
    backupDirectory,
    `legacy-post-categories-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  await writeFile(backupPath, JSON.stringify({ backedUpAt: new Date().toISOString(), posts: legacyPosts }, null, 2));

  const result = await prisma.$runCommandRaw({
    update: "Post",
    updates: [{
      q: { for: { $not: { $type: "array" } } },
      u: [{
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
      }],
      multi: true,
    }],
  });

  const remaining = await prisma.$runCommandRaw({
    count: "Post",
    query: { for: { $not: { $type: "array" } } },
  });
  if (remaining.n !== 0) {
    throw new Error(`Category normalization incomplete: ${remaining.n} records remain. Backup: ${backupPath}`);
  }

  console.log(JSON.stringify({
    normalizedRecords: result.nModified,
    remainingScalarCategories: remaining.n,
    backupFile: path.basename(backupPath),
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Post category normalization failed:", error?.message || "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });