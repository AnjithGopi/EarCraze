const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/EarCrazeProject")
// const UserController=require('./controllers/userController')
// const adminController=require('./controllers/adminController')

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


//user routes
const user_Route=require("./routes/userRoute")
const admin_Route=require("./routes/adminRoute")
app.use("/",user_Route)
app.use("/admin",admin_Route)

app.listen(port,()=>{
    console.log(`server running at http://localhost:${port}`)
})