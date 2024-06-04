import dotenv from 'dotenv'
import connectDb from "./db/server.js";

dotenv.config();

connectDb()



















// import mongoose from "mongoose";
// import express from 'express'
// import { DB_NAME } from "./constant";

// const app = express()

// ;( async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log('Errorr',error);
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log('Server is running on port',process.env.PORT)
//         })
//     } catch (error) {
//         console.log("ERROR",error);        
//     }
// } )()