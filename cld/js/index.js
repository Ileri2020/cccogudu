import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises';


cloudinary.config({ 
    cloud_name: 'drgpl4vsj', 
    api_key: '981145687422755', 
    api_secret: 'FaMr1QHVULEUPsb7eMMHkiXDChQ'
  });



  // const asset_folder = "Praisevid2";
  const asset_folder = "Praiseaudio";
  const max_results = 500;

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
  } catch (error) {
    console.log('Error getting Cloudinary resources', error);
    // Optionally write the error to a file
    await fs.writeFile(`cloudinary-error-${asset_folder}.txt`, JSON.stringify(error, null, 2));
    console.log(`Cloudinary error for ${asset_folder} saved to cloudinary-error-${asset_folder}.txt`);
  }
  
