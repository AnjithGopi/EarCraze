


const express=require("express")
const path=require("path")
const user_Route=express()
const session=require("express-session")
const nodemailer=require('nodemailer')


//------------required controllers------
const userController=require("../controllers/userController")
const cartController=require("../controllers/cartController")

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
user_Route.get("/productDetails",userController.productDetails)

//--------forgotPassword---------


user_Route.get('/forgotPassword',userAuth.isLogout,userController.getForgotPassword)
user_Route.post('/forgotPassword',userAuth.isLogout,userController.postForgotPassword)
user_Route.get('/newOtp',userAuth.isLogout,userController.newOtp)
user_Route.post('/newOtp',userAuth.isLogout,userController.verifyNewOtp)
user_Route.post('/newPassword',userAuth.isLogout,userController.verifyPasswords)
user_Route.get('/logout',userController.loadLogout)


 
//------------------Cart------------

user_Route.get('/cart',userAuth.isLogin,cartController.getCart)
user_Route.post('/addtoCart',userAuth.isLogin,cartController.addtoCart)
user_Route.post('/removeFromCart',userAuth.isLogin,cartController.deleteIteminCart)
user_Route.post('/updateCartItemQuantity',userAuth.isLogin,cartController.updateitemQuantity)
user_Route.get("/checkOut",userAuth.isLogin,cartController.checkOut)
user_Route.post('/placeorder',userAuth.isLogin,cartController.placeOrder)


//..........Dashboard.................

user_Route.get("/userDashboard",userAuth.isLogin,userController.userDash)
user_Route.get("/addressForm",userAuth.isLogin,userController.addressForm)
user_Route.post("/createAddress",userAuth.isLogin,userController.createAddress)
user_Route.get("/cancelOrder",userAuth.isLogin,cartController.cancelOrder)


















module.exports=user_Route