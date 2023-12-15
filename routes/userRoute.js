


const express=require("express")
const path=require("path")
const user_Route=express()
const session=require("express-session")
const nodemailer=require('nodemailer')

const userController=require("../controllers/userController")

user_Route.set('view engine','ejs')
user_Route.set('views','./view/users')


user_Route.get('/',userController.loadHome)
user_Route.get("/signup",userController.loadRegister)
user_Route.post('/signup',userController.verifySignup)
user_Route.get("/login",userController.loadLogin)
user_Route.post('/login',userController.verifyLogin)
user_Route.get('/getOtp',userController.getOtp)
user_Route.post("/Otp",userController.verifyOtp)
user_Route.get("/productDetails",userController.productDetails)

//--------forgotPassword---------


user_Route.get('/forgotPassword',userController.getForgotPassword)
user_Route.post('/forgotPassword',userController.postForgotPassword)
user_Route.get('/newOtp',userController.newOtp)
user_Route.post('/newOtp',userController.verifyNewOtp)
user_Route.post('/newPassword',userController.verifyPasswords)













module.exports=user_Route