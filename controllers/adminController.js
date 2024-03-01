
const User=require("../models/userModel")
const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")
const Order= require('../models/orderModel')
const Coupon=require('../models/couponModel')



const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'sales-report.pdf');


const adminLogin= async(req,res)=>{

    try {
      
        console.log("admin Login")
        res.render("adminlogin")


        
    } catch (error) {
        console.log(error.message);
        
    }



}

const getDashboard=async(req,res)=>{
    try {
        const orderList= await Order.find().sort({orderDate:-1}).limit(5).populate('userId')

        const totalOrders= await Order.find().populate('userId')
        const totalProducts= await Product.find()

        res.render("dashboard",{orderList,totalOrders,totalProducts})
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const verifyAdmin= async(req,res)=>{

    try{

        const adminData= await User.findOne({email:req.body.email})
        if(adminData){

            if(adminData.email==req.body.email && adminData.password==req.body.password){
                if(adminData.is_admin==1){
                    req.session.adminId=adminData._id

                    console.log("Dashboard rendered")

                    res.redirect("/admin/dashboard")
                }
           
            }else{
                res.render("adminlogin",{message:"Access Denied"})

        }
        }
        

    }catch(error){
        console.log(error.message)
    }
    
}


const userList= async(req,res)=>{
    try {
        const userData= await User.find({is_admin:0})

        res.render("userlist",{users:userData})
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const blockUser= async(req,res)=>{

    try {
        const userId=req.query.id
        const userData=await User.findByIdAndUpdate(userId,{is_active:1})
             await userData.save()
   
              const users=await User.find({is_admin:0})
             

              res.redirect("/admin/userlist")
              console.log("user Blocked")
        
    } catch (error) {

        console.log(error.message)
        
    }

}

const unblockUser=async(req,res)=>{
    try {
        
        const userId=req.query.id
        const userData=await User.findByIdAndUpdate(userId,{is_active:0})
        await userData.save()


        const users=await User.find({is_admin:0})
       
        res.redirect("/admin/userlist")    

    } catch (error) {
        console.log(error.message)
        
    }
}

const adminLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const salesReport= async(req,res)=>{
    try {


        const orderList= await Order.find().populate('userId')

        res.render('salesReport',{orderList})
     


    } catch (error) {
        console.log(error.message)
        
    }
}



const salesReportSearch= async(req,res)=>{

    try {

        

        const { start, end } = req.body; 
       
        const orderList = await Order.find({
            orderDate: { $gte: new Date(start), $lte: new Date(end) }
        }).populate('userId');

       
        res.render('salesReport', { orderList,start,end }); 

        
    } catch (error) {
        console.log(error.message)
        
    }
}



const coupon= async(req,res)=>{
    try {


        const coupons= await Coupon.find().sort({_id:-1})
        res.render("coupon",{coupons})
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const createCoupon= async(req,res)=>{
    try {
       
        const {name, code, dpercent,maxamt, mpamt, date } = req.body;
    
      
        const newCoupon = new Coupon({
        name:name,
        code: code,
        discountpercentage:dpercent,
        discountAmount:maxamt,
        minimumAmount:mpamt,
        validUntil:date,
        });
    
       
        const savedCoupon = await newCoupon.save();

        console.log("coupon details:",savedCoupon)
    
       
        // res.status(201).json(savedCoupon);
        res.redirect("/admin/Coupons")
      } catch (error) {
        
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    








module.exports={
    adminLogin,verifyAdmin,userList,blockUser,unblockUser,getDashboard,adminLogout,salesReport,salesReportSearch,coupon,createCoupon
}