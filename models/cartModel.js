const mongoose=require("mongoose")

const cartSchema=mongoose.Schema({

   userId:{type:mongoose.Schema.ObjectId,ref:"User"},

  products:[ {
    productId:{type:mongoose.Schema.ObjectId,
      ref:"Product"},
      quantity:{type:Number}}
    ]
  
   
    })
    

module.exports=mongoose.model("Cart",cartSchema)
