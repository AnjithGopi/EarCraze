const mongoose= require("mongoose")

const orderSchema= mongoose.Schema({

    userId:{type:mongoose.Schema.ObjectId,ref:'User'},
    products:[ {
        productId:{type:mongoose.Schema.ObjectId,
          ref:"Product"},
          quantity:{type:Number}}
        ],


    address:{
     
        first_name:{type:String,required:true},
        last_name:{type:String,required:true},
        address:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        zipcode:{type:Number,required:true},
        mobile:{type:Number,required:true}
    },


    
    orderId:{type:String},
    razOrderId:{type:String},
    paymentMethod:{type:String,required:true},
    paymentStatus:{type:String,enum:['Pending','Recieved','Failed','Refund'],default:"Pending"},
    orderStatus:{type:String,enum:['Order Placed','Confirmed','Shipped','Delivered','Cancelled','Returned'],default:"Order Placed"},
    orderDate:{type:Date,default:Date.now},
    orderId:{type:String},
    totalAmount:{type:String},
    // is_cancelled:{type:Number,default:0},
    deliveryStatus:{type:Number,default:0},
    
    



    




})



module.exports=mongoose.model("Order",orderSchema)