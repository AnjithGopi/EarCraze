

const mongoose=require("mongoose")


const productSchema= mongoose.Schema({
    title:{type:String,required:true},
    brand:{type:mongoose.Schema.Types.ObjectId,ref:'brand'},
    description:{type:String,required:true},
    category:{type: mongoose.Schema.Types.ObjectId,ref:'category'},
    date:{type:Date,default:Date.now},
    regularprice:{type:Number,required:true},
    salesprice:{type:Number,default: function () {
      return this.regularprice; // Set salesprice equal to regularprice by default
  }},
    image:[{ type:String}],
    tags:{type:String},
    is_active:{type:Number,default:0},
    quantity:{type:Number,default:0},
    cat_status:{type:Number,default:0},
    brand_status:{type:Number,default:0}
   
})


productSchema.virtual('formattedDate').get(function () {
    const day = this.date.getDate().toString().padStart(2, '0');
    const month = (this.date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = this.date.getFullYear();
    return `${day}/${month}/${year}`;
  });

module.exports=mongoose.model("Product",productSchema)

