import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log(process.env.CLOUDINARY_CLOUD_NAME,);
console.log(process.env.CLOUDINARY_API_KEY,);
console.log(process.env.CLOUDINARY_API_SECRET,);

const uploadFileToCloudinary = async(localFilePath)=>{
    console.log('local file path ',localFilePath);
    try {

        if (!localFilePath) return null

      const fileDetails = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })

        console.log('file Details ' , fileDetails);

        console.log('File uploaded successfully on cloudinary');
        
        return fileDetails

    } catch (error) {
        fs.unlink(localFilePath,(unlinkError)=>{
            if (unlinkError) {
                console.error('Error deleting local file:', unlinkError);
            } else {
                console.log('Local file deleted successfully');
            }
        })
        console.log('Error cause file upload opration go faild', error);
        return null
    }
}

export{uploadFileToCloudinary}