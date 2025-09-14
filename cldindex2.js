import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

const prisma = new PrismaClient();
cloudinary.config({ 
  cloud_name: 'drgpl4vsj', 
  api_key: '981145687422755', 
  api_secret: 'FaMr1QHVULEUPsb7eMMHkiXDChQ'
});


const asset_folder = "Worshipvid";
const ministryId = "684f74ca135dd6d0efeab37d";
const userId = "68771f546e4233fe08d0f1b0";
const forValue = "worshipvideo";
const type = 'video';

// interface CloudinaryResource {
//   display_name: string;
//   url: string;
//   // Add other properties as needed
// }

const createManyPosts = async (posts) => {
  try {
    const createdPosts = await prisma.post.createMany({ data: posts });
    console.log('many post created', createdPosts);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getAllResourcesInFolder(asset_folder) {
  let allResources= [];
  let nextCursor = null;

  try {
    do {
      const options= {
        max_results: 500,
        tags: true,
        metadata: true,
      };
      if (nextCursor) {
        options.next_cursor = nextCursor;
      }
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

try {
  const resources = await getAllResourcesInFolder(asset_folder);
  console.log(`Received ${resources.length} video objects`);

  // Write result to a JSON file
  await fs.writeFile(`cloudinary-assets-${asset_folder}.json`, JSON.stringify(resources, null, 2));
  console.log(`Cloudinary assets for ${asset_folder} saved to cloudinary-assets-${asset_folder}.json`);

  // Extract display_name and url, create new objects
  const extractedData = resources.map(resource => {
    const processedTitle = resource.display_name
      .replace(/_/g, ' ')
      .slice(0, -6);
    return {
      ministryId,
      title: processedTitle,
      description: '',
      for: forValue,
      url: resource.url,
      type,
      userId,
      duration: "nill",
    };
  });

  // Write extracted data to a new JSON file
  await fs.writeFile(`extracted-cloudinary-assets-${asset_folder}.json`, JSON.stringify(extractedData, null, 2));
  createManyPosts(extractedData);
  console.log(`Extracted Cloudinary assets for ${asset_folder} saved to extracted-cloudinary-assets-${asset_folder}.json`);
} catch (error) {
  console.log('Error getting Cloudinary resources', error);
}

