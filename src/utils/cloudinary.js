import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileToCloudinary = async(localFilePath)=>{
    try {

        if (!localFilePath) return null

      const fileDetails = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })

        // console.log('file Details ' , fileDetails);
        // console.log('File uploaded successfully on cloudinary');

        fs.unlinkSync(localFilePath)
        
        return fileDetails

    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log('Error cause file upload opration go faild', error);
        return null
    }
}

const deleteFileFromCloudinary = async(priviousImageId)=>{
    console.log(priviousImageId);
    try {
        if (!priviousImageId) return null

        const deleteOpration = await cloudinary.uploader.destroy(priviousImageId)

        console.log(deleteOpration);

        if (!deleteOpration) {
            console.log('Error cause file delete opration go faild');
        }

    } catch (error) {
        console.log('Error cause file deletion opration go faild', error);        
    }
}

export{uploadFileToCloudinary,deleteFileFromCloudinary}
