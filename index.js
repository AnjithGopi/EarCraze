const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/EarCrazeProject")
// const UserController=require('./controllers/userController')
// const adminController=require('./controllers/adminController')
const flash = require('express-flash')

const express=require("express")
const sharp= require('sharp')

const session=require("express-session")
const nocache =require('nocache')
const app=express()
const nodemailer=require('nodemailer')
const port=9000

const multer=require("multer")
const storage=multer.memoryStorage()
app.use("/uploads",express.static("uploads"))
const PDFDocument = require('pdfkit');7
const fs = require('fs');
const path = require('path');

const axios= require("axios")





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


    res.send("404 page not found")

})

app.listen(port,()=>{
    console.log(`server running at http://localhost:${port}`)
})