
const Product=require("../models/productModel")
const User=require("../models/userModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")
const Order= require('../models/orderModel')



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

        const{pname,pbrand,pdescription,regularPrice,salesPrice,image,pcategory,tags, is_active,quantity}=req.body


        const productData= new Product({
            title:pname,
            brand:pbrand,
            description:pdescription,
            regularprice:regularPrice,
            salesprice:salesPrice,
            image:req.files.map((file)=>file.path),
            category:pcategory,
            tags:tags,
            is_active:is_active,
            quantity:quantity

        })
        const product=await productData.save()
        console.log(product)
        


       
        
        res.redirect("/admin/addproduct")

        
    } catch (error) {

        console.log(error.message)
        
    }
}

const productList= async(req,res)=>{
    try {

        const productDetails= await Product.find({}).sort({date:-1})
      

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
        // const updateData= await Product.findByIdAndUpdate({_id:id},{$set:{}})
        
        const{pname,pbrand,pdescription,regularPrice,salesPrice,image,category,tags, is_active,quantity}=req.body
        console.log('===================================================');
        console.log(req.body.pbrand, req.body.category);
          
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
        // const product=await productData.save()
        // console.log(updateData)
        res.redirect("/admin/productlist")

        
    } catch (error) {
        console.log(error.message)
        
    }
}

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

        const {brandName,brandDescription,image}=req.body
        let brand = new Brand({
            name:brandName,
            description:brandDescription,
            image:req.files.map((file)=>file.path)
            })
        

        const newBrand = await brand.save()
        console.log(newBrand)
        res.redirect('/admin/brand')



        
    } catch (error) {
        console.log(error.message)

        
    }
}

const blockCategory =async(req,res)=>{
    try {
       
        const categoryId=req.query.id
        const categoryblock= await Category.findByIdAndUpdate(categoryId,{is_active:1})
       

        res.redirect("/admin/categories")
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const unblockCategory= async(req,res)=>{
    try {
        const categoryId= req.query.id
        const categoryUnblock=await Category.findByIdAndUpdate(categoryId,{is_active:0})
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
        const productCat= await Product.findByIdAndUpdate(brandId,{cat_staus:1})
        const productBrand=await Product.findByIdAndUpdate(brandId,{brand_status:1})

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


        // const userId=req.session.userId
       
        const orderList= await Order.find().populate('userId')



        res.render('orderList',{orderList})
        
    } catch (error) {
        console.log(error.message)
        
    }
}




const adminOrderCancel= async(req,res)=>{
    try {

         console.log(" Admin order cancel entered")
        // const userId= req.session.userId
        const orderId=req.query.id
        // const orderCancel=await Order.findByIdAndUpdate(userId,$set{is_cancelled:1})

        // const order = await Order.findByIdAndUpdate(userId, { $set: { is_cancelled: 1 } });
        const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {is_cancelled:1}})



       
       
        console.log("cancel Order Admin::",orderCancel)

         res.redirect('/admin/getOrders')


    

        
    } catch (error) {
        console.log(error.message)
        
    }
}



const isDelivered= async(req,res)=>{

    try {

        




        
    } catch (error) {
        console.log(error.message)
        
    }
}













module.exports={addProduct,addnewProduct,
    productList,editProductLoad,blockProduct,
    unblockProduct,updateProduct,getCatagories,
    addCatagories, brand,addBrand,addNewBrand,blockCategory,
    unblockCategory,editCategoryLoad,updateCategory,blockBrand,
     unblockBrand,getOrders,adminOrderCancel,isDelivered}
    
   