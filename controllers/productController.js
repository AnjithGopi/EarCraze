
const Product=require("../models/productModel")
const User=require("../models/userModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")
const Order= require('../models/orderModel')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require("uuid")
const sharp= require('sharp')



const addProduct=async(req,res)=>{
    try {

        const newcategory= await Category.find({is_active:0})
        const brand=await Brand.find({is_active:0})
        res.render("addProduct",{newcategory,brand})
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const addnewProduct= async(req,res)=>{
    try {
        const processedImages = req.processedImages || [];

        const{pname,pbrand,pdescription,regularPrice,image,pcategory,tags, is_active,quantity}=req.body


        const productData= new Product({
            title:pname,
            brand:pbrand,
            description:pdescription,
            regularprice:regularPrice,
            image:req.files.map((file)=>file.filename),
            category:pcategory,
            tags:tags,
            is_active:is_active,
            quantity:quantity

        })
        const product=await productData.save()
        console.log("add product ::",product)
        // res.redirect("/admin/addproduct")
        
        if(product){
            res.json({success:true,message:'Product added successfully '})
        } else{
            res.json({success:false})
        }
    } catch (error) {

        console.error(error.message)
        
    }
}

const productList= async(req,res)=>{
    try {

        const productDetails= await Product.find({}).sort({date:-1})
      

console.log('products',productDetails)
        res.render("productlist",{product:productDetails})
        
    } catch (error) {
        console.log(error.message)
        
    
        
    }
}

const editProductLoad =async(req,res)=>{
    try {

        const id=req.query.id
        console.log(id)
        const productDetails=await Product.findById({_id:id}).populate('brand')
        const category= await Category.find({})
        const brand= await Brand.find({})
       console.log("Edit product",productDetails)
        if(productDetails){
            res.render("editProduct",{Product:productDetails,category,brand})
        }else{
            res.redirect("admin/productlist")
        }


        
    } catch (error) {
        console.log(error.message)
        
    }
}

const updateProduct= async(req,res)=>{
    try {

        const id=req.query.id
       
        const{pname,pbrand,pdescription,regularPrice,salesPrice,image,category,tags, is_active,quantity}=req.body
    
        
        const updateData= await Product.findByIdAndUpdate({_id:id},{$set:{
            title:pname,
            brand:pbrand,
            category:category,
            description:pdescription,
            regularprice:regularPrice,
            salesprice:salesPrice,
            image: req.files.map((file)=>file.path),
            quantity:quantity

     } })
        
        res.redirect("/admin/productlist")

        
    } catch (error) {
        console.log(error.message)
        
    }
}



const deleteImage=async (req, res) => {


   

    try {

        
        const { imageUrl, productId } = req.body;
        console.log("Image URL:", imageUrl);
        console.log("Product ID:", productId);

        // Find the product by ID and update to remove the image from the array
        const product = await Product.findByIdAndUpdate(
            productId,
            { $pull: { image: imageUrl } },
            { new: true }
        );

        console.log("Updated product:", product); // Log the updated product for debugging

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({ message: 'Image deleted successfully', product })

    

       
    } catch (error) {
        console.error('Error deleting image:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};





const blockProduct=async(req,res)=>{
    try {

        const productId=req.query.id
        const productData= await Product.findByIdAndUpdate(productId,{is_active:1})
       
        

        res.redirect("/admin/productlist")


        
    } catch (error) {
        console.log(error.message)
        
    }
}

const unblockProduct= async(req,res)=>{
    try {

        const productId=req.query.id
        const productData= await Product.findByIdAndUpdate(productId,{is_active:0})

        res.redirect("/admin/productlist")



        
    } catch (error) {
        console.log(error.message)
        
    }
}


const getCatagories= async(req,res)=>{
    try {
        
      const category=  await Category.find()

        res.render("addCatagory",{category})

        
    } catch (error) {
        console.log(error.message)
        
    }

}

const addCatagories=async(req,res)=>{
    try {


        const {catagoryName,catagoryDescription}=req.body
        let catagory = new Category({
            name : catagoryName ,
            description : catagoryDescription
        })

        const newCatagory= await catagory.save()
        console.log(newCatagory)
        res.redirect("/admin/categories")

        
    } catch (error) {
        console.log(error.message)
        
    }
}

const brand=async(req,res)=>{
    try {
        const brand=await Brand.find()

        res.render("brand" ,{brand})
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const addBrand=async(req,res)=>{
    try {

        res.render("addBrand")


        
    } catch (error) {
        console.log(error.message)
        
    }
}

const addNewBrand= async(req,res)=>{
    
    try {

        // const {brandName,brandDescription,image}=req.body
        // let brand = new Brand({
        //     name:brandName,
        //     description:brandDescription,
        //     image:req.files.map((file)=>file.path)
        //     })
        

        // const newBrand = await brand.save()
        // console.log(newBrand)
        // res.redirect('/admin/brand')

        //-----------updated code-------------------



        const { brandName, brandDescription } = req.body;

        const imageUrls = [];
        for (const file of req.files) {
           
            const filename = `${uuidv4()}.jpg`;
            
            await sharp(file.path)
                .resize({ width: 300, height: 300 })
                .toFile(`uploads/${filename}`);
            
           
            const imageUrl = `uploads/${filename}`; 
            imageUrls.push(imageUrl);

           
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                } else {
                    console.log(`File deleted: ${file.path}`);
                }
            });
        
        }

        
        const brand = new Brand({
            name: brandName,
            description: brandDescription,
            image: imageUrls
        });

        
        const newBrand = await brand.save();
        console.log(newBrand);
        res.redirect('/admin/brand');

    } catch (error) {
        console.log(error.message)

        
    }
}





const blockCategory =async(req,res)=>{
    try {
       
        const categoryId=req.query.id
        const categoryblock= await Category.findByIdAndUpdate(categoryId,{is_active:1})
        await Product.updateMany({ category: categoryId }, { is_active: 1 });
        res.redirect("/admin/categories")
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const unblockCategory= async(req,res)=>{
    try {
        const categoryId= req.query.id
        const categoryUnblock=await Category.findByIdAndUpdate(categoryId,{is_active:0})
        await Product.updateMany({ category: categoryId }, { is_active: 0});
        res.redirect("/admin/categories")


        
    } catch (error) {
        console.log(error.message)
        
    }
}


const editCategoryLoad=async(req,res)=>{
    try {

      const categoryId=req.query.id
      const categoryEdit= await Category.findById({_id:categoryId})
      res.render("editCategory",{category:categoryEdit})
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const updateCategory=async(req,res)=>{

    try {

        const id=req.query.id
        const{cname,cdescription}=req.body

        const newCategory= await Category.findByIdAndUpdate({_id:id},{$set:{
            name:cname,
            description:cdescription

        }
           
        })
        console.log(newCategory)
        res.redirect('/admin/categories')
    
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const blockBrand= async(req,res)=>{
    try {
        console.log("brand block")
        const brandId = req.query.id
        const brandBlocked = await Brand.findByIdAndUpdate(brandId,{is_active:1})
        await Product.updateMany({ brand: brandId }, { is_active: 1 });
        // const productCat= await Product.findByIdAndUpdate(brandId,{cat_staus:1})
        // const productBrand=await Product.findByIdAndUpdate(brandId,{brand_status:1})

        res.redirect("/admin/brand")
    }
        
     catch (error) {
        console.log(error.message)
      
    }

}

const unblockBrand= async(req,res)=>{
    try {

        const brandId=req.query.id
        const brandUnblocked=await await Brand.findByIdAndUpdate(brandId,{is_active:0})
        res.redirect("/admin/brand")
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const getOrders= async(req,res)=>{
    try {

        const orderList= await Order.find().sort({orderDate:-1}).populate('userId')
        res.render('orderList',{orderList})
        
    } catch (error) {
        console.log(error.message)
        
    }
}




const adminOrderCancelled= async(req,res)=>{
    try {

         
        const orderId=req.query.id
       
        const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {orderStatus:'Cancelled'}})

         res.redirect('/admin/getOrders')


    

        
    } catch (error) {
        console.log(error.message)
        
    }
}


const adminOrderPending= async(req,res)=>{
    try {

       
        const orderId= req.query.id
        const orderPending= await Order.findByIdAndUpdate(orderId,{$set:{orderStatus:"Pending"}})
        res.redirect('/admin/getOrders')
        
    } catch (error) {

        console.log(error.message)
        
    }
}




const adminOrderShipped= async(req,res)=>{

    try {
       

        const orderId= req.query.id
    
        const orderShipped =await Order.findByIdAndUpdate(orderId,{$set:{ orderStatus:'Shipped'}})
         res.redirect('/admin/getOrders')
        
    } catch (error) {

        console.log(error.message)
        
    }
   
}


const adminOrderDelivered=async(req,res)=>{


    try {


        const orderId= req.query.id
        const orderDelivered= await  Order.findByIdAndUpdate(orderId,{$set:{orderStatus:'Delivered'}})
         res.redirect('/admin/getOrders')
        
    } catch (error) {

        console.log(error.message)
        
    }
   


}


const adminOrderReturned=async(req,res)=>{
    try {
        const orderId= req.query.id
        const orderReturned= await  Order.findByIdAndUpdate(orderId,{$set:{orderStatus:'Returned'}})
         res.redirect('/admin/getOrders')


        
    } catch (error) {
        console.log(error.message)
        
    }
}








const orderDetails= async(req,res)=>{

    try {


        const orderId=req.query.id

        const orderDetails= await Order.findById(orderId).sort({orderDate:-1}).populate('userId').populate('products.productId')
        
        res.render('orderdetails',{orderDetails})


        
    } catch (error) {
        console.log(error.message)
        
    }
}












module.exports={addProduct,addnewProduct,deleteImage,
    productList,editProductLoad,blockProduct,
    unblockProduct,updateProduct,getCatagories,
    addCatagories, brand,addBrand,addNewBrand,blockCategory,
    unblockCategory,editCategoryLoad,updateCategory,blockBrand,
     unblockBrand,getOrders,adminOrderCancelled,orderDetails,adminOrderShipped,
     adminOrderDelivered,adminOrderPending,adminOrderReturned}
    
   