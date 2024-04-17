const mongoose=require("mongoose")
const dotenv = require('dotenv')
dotenv.config()
mongoose.connect(process.env.MONGO_STRING)
// const UserController=require('./controllers/userController')
// const adminController=require('./controllers/adminController')
const flash = require('express-flash')

const express=require("express")
const sharp= require('sharp')

const session=require("express-session")
const nocache =require('nocache')
const app=express()
const nodemailer=require('nodemailer')


const multer=require("multer")
const storage=multer.memoryStorage()
app.use("/uploads",express.static("uploads"))
const PDFDocument = require('pdfkit');7
const fs = require('fs');
const path = require('path');

const axios= require("axios")

app.set('view engine','ejs')
app.set('views','./view/users')





// Middleware to parse JSON and URL-encoded data
app.use(nocache())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"))



// Middleware to handle session
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:true
}))


app.use(flash());


//user routes
 
const user_Route=require("./routes/userRoute")
const admin_Route=require("./routes/adminRoute")

app.use("/",user_Route)
app.use("/admin",admin_Route)


app.use("*",(req,res)=>{


    // res.send("404 page not found")
    res.render("404")

})

app.listen(process.env.PORT,()=>{
    console.log(`server running at http://localhost:${process.env.PORT}`)
})