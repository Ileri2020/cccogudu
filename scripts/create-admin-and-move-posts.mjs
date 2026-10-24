import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("--- 1. Locating Engr Ilerioluwa's user account ---");
  const engrUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: "Engr_ileri_oluwa", mode: "insensitive" } },
        { name: { contains: "ileri", mode: "insensitive" } },
        { email: "adepojuololade2020@gmail.com" },
      ],
    },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!engrUser) {
    throw new Error("Could not find Engr Ilerioluwa user account!");
  }

  console.log(`Found Engr Ilerioluwa: ID=${engrUser.id}, Email=${engrUser.email}, Username=${engrUser.username}, Posts count=${engrUser._count.posts}`);

  console.log("\n--- 2. Creating or finding Admin account: cccoguduexpressway@gmail.com ---");
  const adminEmail = "cccoguduexpressway@gmail.com";
  const hashedPassword = await bcrypt.hash("admin123", 10);

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: "media team",
        name: "Media Team",
        password: hashedPassword,
        role: "admin",
        department: "media",
        contact: "+2348169684400",
        avatarUrl: "http://res.cloudinary.com/dc5khnuiu/image/upload/v1752293076/drasnfgbwzvx9e1mge4m.jpg",
        ministryId: "684f74ca135dd6d0efeab37d",
      },
    });
    console.log(`Created new Admin User: ID=${adminUser.id}, Email=${adminUser.email}, Username=${adminUser.username}, Role=${adminUser.role}`);
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        username: "media team",
        name: "Media Team",
        password: hashedPassword,
        role: "admin",
        department: "media",
      },
    });
    console.log(`Admin account already existed; updated: ID=${adminUser.id}, Email=${adminUser.email}, Username=${adminUser.username}, Role=${adminUser.role}`);
  }

  // Verify password works
  const passwordValid = await bcrypt.compare("admin123", adminUser.password);
  console.log(`Password verification test for 'admin123': ${passwordValid ? "PASSED ✅" : "FAILED ❌"}`);

  console.log("\n--- 3. Moving all posts from Engr Ilerioluwa to Admin account ---");
  const updateResult = await prisma.post.updateMany({
    where: {
      userId: engrUser.id,
    },
    data: {
      userId: adminUser.id,
    },
  });

  console.log(`Moved ${updateResult.count} posts to Admin account (${adminUser.email})!`);

  console.log("\n--- 4. Verification Check ---");
  const engrUpdatedCount = await prisma.post.count({
    where: { userId: engrUser.id },
  });
  const adminUpdatedCount = await prisma.post.count({
    where: { userId: adminUser.id },
  });

  console.log(`Engr Ilerioluwa remaining posts: ${engrUpdatedCount}`);
  console.log(`Admin (media team) total posts: ${adminUpdatedCount}`);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
