
const mongoose=require("mongoose")

const userSchema= mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,unique:true,required:true},
    mobile:{type:String,unique:true,required:true},
    password:{type:String,required:true},
    date:{type:Date,default:Date.now},
    is_admin:{type:Number,default:0},
    is_active:{type:Number,default:0},
    otp:{type:String,default:null}

})


module.exports= mongoose.model("User",userSchema)