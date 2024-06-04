import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookies-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: '20kb'}))
app.use(express.urlencoded({limit: '20kb', extended:true}))
app.use(express.static('public'))

app.use(cookieParser())

export { app }