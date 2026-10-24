import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cccPosts = await prisma.post.findMany({
    where: {
      for: {
        has: "ccc"
      }
    },
    select: {
      id: true,
      title: true,
      for: true,
      type: true,
      url: true,
      isVerified: true
    },
    take: 10
  });

  console.log("Found CCC posts count:", await prisma.post.count({ where: { for: { has: "ccc" } } }));
  console.log("Sample CCC posts:", JSON.stringify(cccPosts, null, 2));
}

main().finally(() => prisma.$disconnect());
