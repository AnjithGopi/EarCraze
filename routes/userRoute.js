


const express=require("express")
const path=require("path")
const user_Route=express()
const session=require("express-session")
const nodemailer=require('nodemailer')

const userController=require("../controllers/userController")
const userAuth=require('../middleware/userAuth')

user_Route.set('view engine','ejs')
user_Route.set('views','./view/users')


user_Route.get('/',userController.loadHome)
user_Route.get("/signup",userAuth.isLogout,userController.loadRegister)
user_Route.post('/signup',userAuth.isLogout,userController.verifySignup)
user_Route.get("/login",userAuth.isLogout,userController.loadLogin)
user_Route.post('/login',userController.verifyLogin)
user_Route.get('/getOtp',userAuth.isLogout,userController.getOtp)
user_Route.post("/Otp",userAuth.isLogout,userController.verifyOtp)
user_Route.get("/productDetails",userAuth.isBlocked,userController.productDetails)

//--------forgotPassword---------


user_Route.get('/forgotPassword',userAuth.isLogout,userController.getForgotPassword)
user_Route.post('/forgotPassword',userAuth.isLogout,userController.postForgotPassword)
user_Route.get('/newOtp',userAuth.isLogout,userController.newOtp)
user_Route.post('/newOtp',userAuth.isLogout,userController.verifyNewOtp)
user_Route.post('/newPassword',userAuth.isLogout,userController.verifyPasswords)
user_Route.get('/logout',userController.loadLogout)













module.exports=user_Route