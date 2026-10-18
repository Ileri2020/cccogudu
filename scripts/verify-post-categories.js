import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const [posts, nonArrayCount, worshipCount, praiseCount, cccCount] = await Promise.all([
    prisma.post.findMany({ select: { id: true, for: true } }),
    prisma.$runCommandRaw({ count: "Post", query: { for: { $not: { $type: "array" } } } }),
    prisma.post.count({ where: { for: { has: "worship" } } }),
    prisma.post.count({ where: { for: { has: "praise" } } }),
    prisma.post.count({ where: { for: { has: "ccc" } } }),
  ]);

  if (nonArrayCount.n !== 0) {
    throw new Error(`${nonArrayCount.n} Post.for values are still not arrays.`);
  }

  console.log(JSON.stringify({
    prismaReadablePosts: posts.length,
    remainingNonArrayCategories: nonArrayCount.n,
    taggedWorship: worshipCount,
    taggedPraise: praiseCount,
    taggedCcc: cccCount,
  }, null, 2));
} finally {
  await prisma.$disconnect();
}
