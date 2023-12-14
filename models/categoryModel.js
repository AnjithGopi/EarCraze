
const mongoose=require ("mongoose")


const categorySchema= mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    is_active:{type:Number,default:0},

})

module.exports=mongoose.model("category",categorySchema)
