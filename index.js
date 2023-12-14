const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/EarCrazeProject")
// const UserController=require('./controllers/userController')
// const adminController=require('./controllers/adminController')

const express=require("express")
const session=require("express-session")
const app=express()
const nodemailer=require('nodemailer')
const port=4000


const multer=require("multer")
const storage=multer.memoryStorage()
app.use("/uploads",express.static("uploads"))
const upload = multer({storage});
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
       // Use Sharp to process the image (e.g., resize to 300x300 pixels)
    const processedBuffer = await sharp(req.file.buffer)
    .resize({ width: 720, height: 720 })
    .toBuffer();

  // Save the processed image or handle it as needed
  // Here, we are just sending the processed image as a response
  res.type('jpeg').send(processedBuffer);
} catch (error) {
  console.error('Error processing/uploading file:', error);
  res.status(500).send('Error processing/uploading file.');
}
});

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,'/uploads')//uploads is the destination
//     },
//     filename:function(req,file,cb){
//         //Define the file name for the uploaded file
//         cb(null,file.originalname)
//     }
// })



// Middleware to parse JSON and URL-encoded data
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