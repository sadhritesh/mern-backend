import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloudinary = async (fileLocalPath) => {

    try {
        if (!fileLocalPath) {
            return null 
        }

        const response = await cloudinary.uploader.upload(fileLocalPath, {
            resource_type : 'auto'
        })

        fs.unlinkSync(fileLocalPath)
        return response
    } catch (error) {
        fs.unlinkSync(fileLocalPath)
        return null
    }
}

const deleteFileFromCloudinary = async (url) => {
    //url = 'http://res.cloudinary.com/sadhcloud/image/upload/v1713862006/ogazqih9chvlgwtea3ee.png'
    try {
        if (!url) {
            return null
        }

        const tempArray = url.split("/")
        const publicId = tempArray[tempArray.length-1].split(".")[0]

        await cloudinary.uploader.destroy(publicId, () => {
            console.log("Image deleted from cloudinary with public_id:", publicId)
        })
    } catch (error) {
        console.log("Error occured in deleteing img from cloudinary :", error.message)
    }
}

export {
    uploadFileOnCloudinary,
    deleteFileFromCloudinary
}