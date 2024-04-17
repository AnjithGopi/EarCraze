
const Product=require("../models/productModel")
const User=require("../models/userModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")
const Order= require('../models/orderModel')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require("uuid")
const sharp= require('sharp')
const { log } = require("console")



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


        console.log("req.bodu.regprice:",req.body.regularPrice)
        


        // const { id } = req.query;
    
        // const product = await Product.findById(id);
        // if (!product) {
        //     return res.status(404).send({ success: false, message: 'Product not found.' });
        // }

        // Update product data based on the form fields (e.g., pname, pdescription, quantity, etc.)
        // product.title = req.body.pname;
        // product.description = req.body.pdescription;
        // product.quantity = req.body.quantity;
        // product.category = req.body.category;
        // product.brand = req.body.pbrand;
        // product.regularprice = req.body.regularPrice;
        // product.salesprice = req.body.salesPrice;

       

       

        // Save the updated product
        // const updatedProduct = await product.save();
        // res.status(200).json({ success: true, message: 'Product updated successfully.', updatedProduct });
        // res.redirect("/admin/productlist")



        let price= parseInt(req.body.regularPrice)
        console.log("price1:",price)
        const { id } = req.query;

        const product = await Product.findById(id);

        console.log("product:",product)
        if (!product) {
            return res.status(404).send({ success: false, message: 'Product not found.' });
        }

        if(product.category!=req.body.category){
            
            console.log("price:",product.salesprice)
            const cat= await Category.findById(req.body.category)

            const newPrice=  Math.round(product.regularprice * ((100 - cat.offerPercent) / 100));
            console.log("dissss=:",cat.discount)

            price=newPrice


            console.log("price:",price)

        }


        if(product.regularprice!=req.body.regularPrice){
            
            console.log("price:",product.salesprice)
            const cat= await Category.findById(req.body.category)

            const newPrice=  Math.round(req.body.regularPrice * ((100 - cat.offerPercent) / 100));
            console.log("dissss=:",cat.discount)

            price=newPrice


            console.log("price:",price)

        }

        // Update product data based on the form fields (e.g., pname, pdescription, quantity, etc.)
        product.title = req.body.pname;
        product.description = req.body.pdescription;
        product.quantity = req.body.quantity;
        product.category = req.body.category;
        product.brand = req.body.pbrand;
        product.salesprice = parseInt(price);
        product.regularprice = req.body.regularPrice;

        // Check if new images are uploaded

        if (req.files || req.files.filename) {
            console.log("image is uploaded,,,,,,,,,,,,,,,",req.files)
            // const images = Array.isArray(req.files) ? req.files.filename : [req.files.filename];
            console.log('//////////////////////////////////////////////')
            const images = req.files.map(item=>item.filename)
            console.log("images........AAAAAAAAAAAAAAAAAAAAAAAAa",images)
            // product.image = product.image.concat(images.map(image => console.log("image:",image)));
            product.image = product.image.concat(images);

        }

        // Save the updated product
        const updatedProduct = await product.save();

        // res.status(200).json({ success: true, message: 'Product updated successfully.', updatedProduct });

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


        // const {catagoryName,catagoryDescription}=req.body
        // let catagory = new Category({
        //     name : catagoryName ,
        //     description : catagoryDescription
        // })

        // const newCatagory= await catagory.save()
        // console.log(newCatagory)
        // res.redirect("/admin/categories")


        const { categoryName, categoryDescription } = req.body;

        // Check if the category name already exists
        const existingCategory = await Category.findOne({ name: categoryName });
        const exists = !!existingCategory;

        if (exists) {
            res.status(400).json({ error: 'Category already exists' });
            return;
        }

        // Create the new category if it doesn't exist
        let category = new Category({
            name: categoryName,
            description: categoryDescription,
        });

        const newCategory = await category.save();
        console.log(newCategory);
        res.status(201).json(newCategory);
        
        // res.redirect("/admin/categories");
       
        
    } catch (error) {
        console.log(error.message)
        
    }
}

// const categoryExist= async(req,res)=>{
//     try {
//         const { categoryName } = req.body;
//         const existingCategory = await Category.findOne({ name: categoryName });
//         const exists = !!existingCategory;
//         res.json({ exists });
        
//     } catch (error) {
//         console.log(error.message)
        
//     }
// }

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


        const orderId = req.query.id;
        const order = await Order.findById(orderId);


        // Check if payment method is cash on delivery (COD)
        if (order.paymentMethod === 'Cash on delivery'||order.paymentMethod==='Wallet'||order.paymentMethod==='Razorpay') {
            
            const orderDelivered= await  Order.findByIdAndUpdate(orderId,{$set:{orderStatus:'Delivered',paymentStatus:"Recieved"}})
        }else{

            const orderDelivered= await  Order.findByIdAndUpdate(orderId,{$set:{orderStatus:'Delivered'}})

        }
        
     
    
        res.redirect('/admin/getOrders');
        
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
     adminOrderDelivered,adminOrderPending,adminOrderReturned,}
    
   