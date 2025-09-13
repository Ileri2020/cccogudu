
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises';
const prisma = new PrismaClient()


cloudinary.config({ 
    cloud_name: 'drgpl4vsj', 
    api_key: '981145687422755', 
    api_secret: 'FaMr1QHVULEUPsb7eMMHkiXDChQ'
  });



  const asset_folder = "Praisevid2";
  //const asset_folder = "Praiseaudio";
  const max_results = 500;
  const ministryId = "684f74ca135dd6d0efeab37d";
  const userId = "68771f546e4233fe08d0f1b0";
  const forValue = "praisevideo";
  const type = 'video'
  const currentTime = new Date().toISOString();


  const createManyPosts = async (posts) => {
    try {
      const createdPosts = await prisma.post.createMany({
        data: posts,
      });
      console.log('many post created', createdPosts)
      return
    } catch (error) {
      console.error(error);
      throw error;
    }
  }



  try {
    const result = await cloudinary.api.resources_by_asset_folder(asset_folder, {
      max_results,
      tags: true,
      metadata: true
    });

    console.log(`Received ${result.resources.length} video objects`);
  
    // Write result to a JSON file
    await fs.writeFile(`cloudinary-assets-${asset_folder}.json`, JSON.stringify(result, null, 2));
    console.log(`Cloudinary assets for ${asset_folder} saved to cloudinary-assets-${asset_folder}.json`);


    
  // Extract display_name and url, create new objects
  const extractedData = result.resources.map(resource => ({
    ministryId,
    title: resource.display_name,
    description: '',
    for: forValue,
    url: resource.url,
    //type: resource.resource_type,
    type,
    userId,
    duration: "nill",
    // createdAt: currentTime,
    // updatedAt: currentTime,
  }));

  // Write extracted data to a new JSON file
  await fs.writeFile(`extracted-cloudinary-assets-${asset_folder}.json`, JSON.stringify(extractedData, null, 2));
  createManyPosts(extractedData)
  console.log(`Extracted Cloudinary assets for ${asset_folder} saved to extracted-cloudinary-assets-${asset_folder}.json`);


  } catch (error) {
    console.log('Error getting Cloudinary resources', error);
    // Optionally write the error to a file
    //await fs.writeFile(`cloudinary-error-${asset_folder}.txt`, JSON.stringify(error, null, 2));
    //console.log(`Cloudinary error for ${asset_folder} saved to cloudinary-error-${asset_folder}.txt`);
  }
  
