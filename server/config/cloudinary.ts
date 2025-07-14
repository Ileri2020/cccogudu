

"use server"
import { v2 as cloudinary } from 'cloudinary';
import streamifier from "streamifier"





// Configuration
cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});



export const uploadCloudinary = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
            });
          }
        }
      ).end(buffer);
  
      // const stream = streamifier.createReadStream(buffer);
      // stream.pipe(uploadStream);
    });
  };


  export async function cloudUpload (inFile) {
    console.log("about to upload cloudinary")
    const file = inFile as File
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer) 
    // uploadCloudinary(buffer, "./csf")
    uploadCloudinary(buffer, "./csf")
    .then(result => {
      console.log('Upload successful:', result);
    })
    .catch(error => {
      console.error('Upload failed:', error);
    });
  }

  export async function handleUpload(file:any) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
  }
  


export default {uploadCloudinary, cloudinary}

// cloudinary.v2.api
//   .delete_resources(['succo/img/stocks/mxaeevqkf9dop4vnv5w7'], 
//     { type: 'upload', resource_type: 'image' })
//   .then(console.log);