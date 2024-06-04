import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

async function connectDb() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected:: DB HOST ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("ERROR IN DB_CONNECTION ",error);  
        process.exit(1)      
    }
}

export default connectDb