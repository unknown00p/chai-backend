import dotenv from 'dotenv'
import connectDb from "./db/server.js";
import { app } from './app.js';
import dotEnv from 'dotenv'

dotEnv.config();

const port = process.env.PORT || 3000

connectDb()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server is running on port http://localhost:${port}`)
    })

    app.on('error',(error)=>{
        console.log('error ',error);
    })
})
.catch((error)=> console.log('Error in DataBase connection !! ', error))



















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