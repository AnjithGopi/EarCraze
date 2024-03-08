const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({

    name:{type:String,required:true, unique:true},
    code: { type: String, required: true, unique: true  },
    discountpercentage: { type: Number, required: true  },
    minimumAmount: { type: Number, required: true },
    validUntil: { type: Date, required: true  },
    is_active: { type: Boolean, default: true },
    maxPerUser:{type:Number,default:1},
    redemptionHistory:[
        
        {userId:{type:String},
    usedOn:{type:Date}}
    ]

});


module.exports=mongoose.model("Coupon",couponSchema)