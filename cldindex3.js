import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

const prisma = new PrismaClient();

cloudinary.config({ 
  cloud_name: 'drgpl4vsj', 
  api_key: '981145687422755', 
  api_secret: 'FaMr1QHVULEUPsb7eMMHkiXDChQ'
});

// ==================== Configuration ====================
const ministryId = "684f74ca135dd6d0efeab37d";
const userId = "68771f546e4233fe08d0f1b0";

const assetConfigs = [
  { asset_folder: "Worshipvid", forValue: "worshipvideo", type: "video" },
  { asset_folder: "Praisevid2", forValue: "praisevideo", type: "video" },
  { asset_folder: "Praisevid", forValue: "praisevideo", type: "video" },
  { asset_folder: "Worshipvid2", forValue: "worshipvideo", type: "video" },
  { asset_folder: "Praiseaudio", forValue: "worshipvideo", type: "audio" },
  { asset_folder: "Praiseaudio", forValue: "worshipvideo", type: "audio" },
  { asset_folder: "Worshipaudio", forValue: "worshipvideo", type: "audio" },
  { asset_folder: "Worshipaudio2", forValue: "worshipvideo", type: "audio" },
];

// ==================== Helper Functions ====================
async function getAllResourcesInFolder(asset_folder) {
  let allResources = [];
  let nextCursor = null;

  try {
    do {
      const options = { max_results: 500, tags: true, metadata: true };
      if (nextCursor) options.next_cursor = nextCursor;

      const result = await cloudinary.api.resources_by_asset_folder(asset_folder, options);
      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`Fetched ${allResources.length} resources from folder '${asset_folder}'.`);
    return allResources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

async function createManyPostsIfNotExists(posts) {
  try {
    if (posts.length === 0) return;

    // Fetch all existing titles to avoid duplicates
    const titles = posts.map(p => p.title);
    const existingPosts = await prisma.post.findMany({
      where: { title: { in: titles } },
      select: { title: true }
    });
    const existingTitles = new Set(existingPosts.map(p => p.title));

    // Filter out existing posts
    const newPosts = posts.filter(p => !existingTitles.has(p.title));

    if (newPosts.length === 0) {
      console.log('No new posts to create.');
      return;
    }

    const created = await prisma.post.createMany({ data: newPosts });
    console.log(`Created ${created.count} new posts.`);
  } catch (error) {
    console.error('Error creating posts:', error);
    throw error;
  }
}

// ==================== Main Function ====================
async function main() {
  for (const config of assetConfigs) {
    try {
      const resources = await getAllResourcesInFolder(config.asset_folder);

      // Save raw resources
      await fs.writeFile(
        `cloudinary-assets-${config.asset_folder}.json`,
        JSON.stringify(resources, null, 2)
      );

      // Process resources into post objects
      const posts = resources.map(resource => {
        const processedTitle = resource.display_name.replace(/_/g, ' ').slice(0, -6);
        return {
          ministryId,
          title: processedTitle,
          description: '',
          for: config.forValue,
          url: resource.url,
          type: config.type,
          userId,
          duration: "nill",
        };
      });

      // Save extracted post data
      await fs.writeFile(
        `extracted-cloudinary-assets-${config.asset_folder}.json`,
        JSON.stringify(posts, null, 2)
      );

      // Batch create new posts if not already in DB
      await createManyPostsIfNotExists(posts);

    } catch (error) {
      console.error(`Error processing folder "${config.asset_folder}":`, error);
    }
  }
}

// ==================== Run ====================
main()
  .then(() => {
    console.log('All folders processed successfully.');
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error('Error in main execution:', err);
    prisma.$disconnect();
  });
