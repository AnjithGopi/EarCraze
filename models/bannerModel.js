


const mongoose= require("mongoose")


const bannerSchema= mongoose.Schema({

    name:{type:String ,required:true},
    description:{type:String,required:true},
    startDate:{type:Date,required:true},
    endDate:{type:Date,required:true},
    image:[{type:String}],
    is_active:{type:Boolean,default:true}

})

module.exports= mongoose.model("Banner",bannerSchema)