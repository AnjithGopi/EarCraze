
const mongoose=require ("mongoose")


const categorySchema= mongoose.Schema({
    name:{type:String,},
    description:{type:String,},
    is_active:{type:Number,default:0},
    offerPercent:{type:Number,default:0},
    expiry:{type:Date,default:Date.now},
    offerActive:{type:Boolean,default:false}


})

module.exports=mongoose.model("category",categorySchema)
