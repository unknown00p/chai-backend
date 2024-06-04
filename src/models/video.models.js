import {Schema,model} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema({
    videoFile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublised:{
        type:Boolean,
        default:true
    }
},{timeseries:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video",videoSchema)