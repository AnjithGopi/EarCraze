
const User=require("../models/userModel")
const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")
const Order= require('../models/orderModel')



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

        res.render("dashboard")
        
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
              // res.render("userlist",{message:"user Blocked",users})

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
        // res.render("userlist",{message:"user Unblocked",users})
        console.log("user unblocked")
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






module.exports={
    adminLogin,verifyAdmin,userList,blockUser,unblockUser,getDashboard,adminLogout
}