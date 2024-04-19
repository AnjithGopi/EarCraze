

const User=require("../models/userModel")
const nodemailer=require('nodemailer')
const Product=require("../models/productModel")
const Address=require("../models/addressModel")
const Cart= require("../models/cartModel")
const Order= require("../models/orderModel")
const bcrypt= require('bcrypt')
const Brand= require("../models/brandModel")
const Category=require("../models/categoryModel")
const Banner= require("../models/bannerModel")
const Wallet= require("../models/walletModel")
const Contact= require('../models/contactModel')





const loadHome=async(req,res)=>{
    try {


        var search = ""
        if( req.body.search){
            search= req.body.search
        }

        const productData=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]}) .populate('category').sort({ date: -1 }) // Sort by date in descending order (newest first)
        .limit(9).exec();

        const categories= await Category.find({is_active:false})

        const banners= await Banner.find()
        
        const userId=req.session.userId;
        const brands= await Brand.find()
        const loginData = await User.findById(userId)
        if(productData){
            // res.render("home",{product:productData})

            res.render("home",{product:productData,loginData,brands,banners,categories})
        }
   
    } catch (error) {
        console.log(error.message);
        
    }
}






const loadRegister= async(req,res)=>{
    try {
        res.render('registration')
        
    } catch (error) {
        console.log(error,{message:" Cannot render Register "})
        
    }
}




const loadLogin=async(req,res,next)=>{
    try {
        const from = req.query.from;
        if(from=='pass'){
            res.render('login',{msg:true})
        }else{
            res.render('login')
        }
        
        
    } catch (error) {
        console.log(error,"Cannot Render Login Page ")
        
    }

}



const verifySignup=async(req,res)=>{
    try {
        
        if(req.body.password==req.body.cpassword){
           
            const data={
                name: req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:req.body.password,
               
                
            }
           

          
            req.session.data=data
       
            res.redirect('/getOtp')

        
    }
           
    } catch (error) {
        console.log(error.message)
        
    }
}



const getOtp=async(req,res)=>{
    try {
      
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
               
                pass:process.env.PASS
            }
        });

        
        // =================   OTP  generation  =========================

        var randomotp=Math.floor(1000 + Math.random() * 9000).toString();
        req.session.otp=randomotp
        const {email,name}=req.session.data
        console.log(randomotp);
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Hello ${name}`,
            text: `Your verification OTP is ${randomotp}`
           
         };
         console.log(randomotp)

         transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
         });
         res.render("otp",{randomotp})
       

    
    } catch (error) {
        console.log(error.message)
    }
}


const verifyOtp= async(req,res)=>{
    try {

        if(req.body.otp==req.body.generatedOtp){

            const{name,email,mobile,password}=req.session.data
            

            const userdata=new User({
             name: name,
             email:email,
             mobile:mobile,
             password:password,
            
               })
               const saltRounds=10
               const hashedPassword= await bcrypt.hash(userdata.password,saltRounds)
               userdata.password=hashedPassword
               
               const userData= await userdata.save()

              
     
             
             if(userData) {

                
               
             res.json(   {
                    "success": true,
                    "message": "OTP verification successful",
                    
                  }
             )
                
     
             }
    

            }else{
                let randomotp=req.session.otp
                res.render("otp",{message:"Invalid otp",randomotp})
            }

       }catch (error) {
        console.log(error.message)
     
        

           }

        
       
}



const verifyLogin = async (req,res)=>{
    try {
        
        const loginData= await User.findOne({email:req.body.email})

       
        if(loginData && loginData.is_active == 1) {
            return    res.render("login",{message:"User blocked by Admin"})
        }

            if(loginData && loginData.is_active == 0){
                if(req.body.email==loginData.email) {
                    const isMatch=await bcrypt.compare(req.body.password,loginData.password)

               
                if(isMatch){
                    
                        const productData=await Product.find({is_active:0})
                      
                        if(productData){
                            req.session.userId=loginData._id
                          
                            res.redirect("/")
                        }

                
            }else{
                res.render("login",{message:"Invalid Credentials"})
            }
                
                   
        }

            }else{
                res.render("login",{message:"Invalid email or password"})

            }
        
       
       

        
        
    } catch (error) {
        console.log(error.message)
        
    }
}




const productDetails= async(req,res)=>{

    try {

        const id= req.query.id
        const userId= req.session.userId
        const loginData= await User.findById(userId)
        const ptData= await Product.findOne({_id:id}).populate('brand').populate("category")
     
        if(ptData){

            res.render("productDetails" ,{products:ptData,loginData})
        }
        
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const getForgotPassword= async(req,res)=>{
    try {

        res.render("emailField")


        
    } catch (error) {
        console.log(error.message)
        
    }
}



const postForgotPassword=async(req,res)=>{
    try {


        const verifyEmail= await User.findOne({email:req.body.email})
        
        if(verifyEmail){

            req.session.email=req.body.email
           res.redirect("/newOtp")

        }else{

            res.render("emailField",{verifyEmail,message:"User not Found"})
        }
        
    } catch (error) {
        console.log(error.message)
        
    }
}




const newOtp= async(req,res)=>{
    try {

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
              
                pass:process.env.PASS
            }
        });

        const userData=await User.findOne({email:req.session.email})

        
        // =================   OTP  generation  =========================//

        var randomotp=Math.floor(1000 + Math.random() * 9000).toString();
        req.session.passwordOtp=randomotp
       
        console.log(randomotp);
        const mailOptions = {
            from: process.env.EMAIL,
            to: req.session.email,
            subject: `Hello ${userData.name}`,
            text: `Your verification OTP is ${randomotp}`
            
            
         };
         console.log(randomotp)

         transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
         });
         res.render("resetOtp",{randomotp})

        
    } catch (error) {
        console.log(error.message)
        
    }
}


const verifyNewOtp = async(req,res)=>{
    try {

        let userOtp=req.body.newOtp;
        if(userOtp===req.session.passwordOtp){
            return  res.render("newPassword");
        }else{
            res.render("resetOtp",{message:"Invalid OTP"})
        }
        
    } catch (error) {
        console.log(error.message)
        
    }
   
}


const verifyPasswords= async(req,res)=>{
    try {
        if(req.body.newPassword==req.body.confirmPassword){
            const newpass = req.body.newPassword
       const userData = await User.findOne({email:req.session.email});
       const saltRounds=10
       const hashedPassword= await bcrypt.hash(newpass,saltRounds)
    
       userData.password=hashedPassword
       await userData.save()
     

      
        res.redirect("/login?from=pass")

        }else{
            return res.render("newPassword",{message:"Passwords not match"})
        }
       
  
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const loadLogout= async(req,res)=>{
    try {

        req.session.userId  =null
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const userDash= async(req,res)=>{
    try {

        const userId=req.session.userId

       
        const userDetails= await User.findById({_id:userId})
        const showAddress= await Address.find({userId:userId})
        const loginData= await User.findById(userId)

        // Fetch user wallet details
        const walletDetails = await Wallet.findOne({ user_id: userId });


        
        const order= await Order.find({userId:userId}).sort({ orderDate:-1})
        res.render("userProfile",{showAddress,userDetails,order,loginData,walletDetails})
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const addressForm= async(req,res)=>{
    try {

        res.render("shippingAddressform")
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const  createAddress= async(req,res)=>{


    try {
        const userId=req.session.userId

        const{fname,lname,address,city,state,country,zipcode,mobile}=req.body

        const addressdata= new Address({

            userId:userId,
            first_name:fname,
            last_name:lname,
           
            address:address,
            city:city,
            state:state,
            country:country,
            zipcode:zipcode,
            mobile:mobile
        })

        const addressData= await addressdata.save()
        res.redirect('/userDashboard')

       
        


    } catch (error) {
        console.log(error.message)
        
    }
}



const editProfile=async(req,res)=>{
    try {



        const userId= req.session.userId
        const loginData = await User.findById(userId)

        



        res.render("changePassword",{loginData})


        // res.render("userProfile",{loginData})
        
        
    } catch (error) {
        console.log(error.message)
        
    }
}




const updatePassword = async (req, res) => {
    try {

        const { email, password, npassword, cnpassword } = req.body;
        

        if (npassword !== cnpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(npassword, saltRounds);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};




const invoiceShow=async(req,res)=>{
    try {

        const orderId= req.query.id

        const invoice= await Order.findById(orderId).populate('userId').populate('products.productId')

        res.render("invoice",{invoice})
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const shop= async(req,res)=>{
    try {




        const userId= req.session.userId
        const loginData = await User.findById(userId)

        let page = parseInt(req.query.page) || 1; // Default page number is 1
        const limit = 12; // Number of products per page




        var search = ""
        if( req.body.search){
            search= req.body.search
        }



        const count = await Product.countDocuments({
            is_active: 0,
            cat_status: 0,
            brand_status: 0,
            $or: [{ title: { $regex: search, $options: 'i' } }]
        });

        const totalPages = Math.ceil(count / limit);
        page = Math.min(totalPages, Math.max(1, page)); // Ensure page number is within valid range




        const products=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]}) .populate('category').sort({ date: -1 }) .skip((page - 1) * limit) // Skip records based on page number
        .limit(limit) // Limit records per page
        .exec(); // Sort by date in descending order (newest first)
        


       
        
        res.render("shop",{products,loginData,totalPages, currentPage: page})

        

        
    } catch (error) {
        console.log(error.message)
        
    }
}



const lowtohigh= async(req,res)=>{


    try {


       

        
        const userId= req.session.userId
        const loginData = await User.findById(userId)

        let page = parseInt(req.query.page) || 1; // Default page number is 1
        const limit = 12; // Number of products per page




        var search = ""
        if( req.body.search){
            search= req.body.search
        }



        const count = await Product.countDocuments({
            is_active: 0,
            cat_status: 0,
            brand_status: 0,
            $or: [{ title: { $regex: search, $options: 'i' } }]
        });

        const totalPages = Math.ceil(count / limit);
        page = Math.min(totalPages, Math.max(1, page)); // Ensure page number is within valid range




        const products=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]}) .populate('category').sort({salesprice:1}) .skip((page - 1) * limit) // Skip records based on page number
        .limit(limit) // Limit records per page
        .exec(); // Sort by date in descending order (newest first)
        


       
        
        res.render("shop",{products,loginData,totalPages, currentPage: page})



        
    } catch (error) {
        console.log(error.message)
        
    }
}



const hightoLow= async(req,res)=>{
    try {

        
        const userId= req.session.userId
        const loginData = await User.findById(userId)

        let page = parseInt(req.query.page) || 1; // Default page number is 1
        const limit = 12; // Number of products per page




        var search = ""
        if( req.body.search){
            search= req.body.search
        }



        const count = await Product.countDocuments({
            is_active: 0,
            cat_status: 0,
            brand_status: 0,
            $or: [{ title: { $regex: search, $options: 'i' } }]
        });

        const totalPages = Math.ceil(count / limit);
        page = Math.min(totalPages, Math.max(1, page)); // Ensure page number is within valid range




        const products=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]}) .populate('category').sort({salesprice:-1}) .skip((page - 1) * limit) // Skip records based on page number
        .limit(limit) // Limit records per page
        .exec(); // Sort by date in descending order (newest first)
        


       
        
        res.render("shop",{products,loginData,totalPages, currentPage: page})





        
    } catch (error) {
        console.log(error.message)
        
    }
}


const atoz =async(req,res)=>{
    try {

         
        const userId= req.session.userId
        const loginData = await User.findById(userId)

        let page = parseInt(req.query.page) || 1; // Default page number is 1
        const limit = 12; // Number of products per page




        var search = ""
        if( req.body.search){
            search= req.body.search
        }



        const count = await Product.countDocuments({
            is_active: 0,
            cat_status: 0,
            brand_status: 0,
            $or: [{ title: { $regex: search, $options: 'i' } }]
        });

        const totalPages = Math.ceil(count / limit);
        page = Math.min(totalPages, Math.max(1, page)); // Ensure page number is within valid range




        const products=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]}) .populate('category').sort({title:1}) .skip((page - 1) * limit) // Skip records based on page number
        .limit(limit) // Limit records per page
        .exec(); // Sort by date in descending order (newest first)
        


       
        
        res.render("shop",{products,loginData,totalPages, currentPage: page})








        
    } catch (error) {
        console.log(error.message)
        
    }
}



const ztoa= async(req,res)=>{
    try {

        const userId= req.session.userId
        const loginData = await User.findById(userId)

        let page = parseInt(req.query.page) || 1; // Default page number is 1
        const limit = 12; // Number of products per page




        var search = ""
        if( req.body.search){
            search= req.body.search
        }



        const count = await Product.countDocuments({
            is_active: 0,
            cat_status: 0,
            brand_status: 0,
            $or: [{ title: { $regex: search, $options: 'i' } }]
        });

        const totalPages = Math.ceil(count / limit);
        page = Math.min(totalPages, Math.max(1, page)); // Ensure page number is within valid range




        const products=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]}) .populate('category').sort({title: -1}) .skip((page - 1) * limit) // Skip records based on page number
        .limit(limit) // Limit records per page
        .exec(); // Sort by date in descending order (newest first)
        


       
        
        res.render("shop",{products,loginData,totalPages, currentPage: page})


        
    } catch (error) {
        console.log(error.message)
        
    }
}










const filterProdutcs = async(req,res)=>{
    try {


        const categoryId = req.query.id; // Get the category ID from query parameter
        const userId=req.session.userId;
        const categories= await Category.find()
        const banners= await Banner.find()
        const loginData = await User.findById(userId)

        const brands= await Brand.find()
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        // Assuming you have a Product model imported and set up
        const product = await Product.find({category:categoryId}).populate("category").exec();

        if (!product || product.length === 0) {
            return res.status(404).json({ error: 'No products found for the category' });
        }

        res.render("home",{product,categories,brands,banners,loginData})
        
    } catch (error) {


        console.log(error.message)
        
    }
}


const sortBrand= async(req,res)=>{
    try {

        const brandId= req.query.id
        const userId=req.session.userId;
        const categories= await Category.find()
        const brands= await Brand.find()
        const banners= await Banner.find()
        const product= await Product.find({brand:brandId}).populate("category")
        const loginData = await User.findById(userId)
        
        if (!product || product.length === 0) {
            return res.status(404).json({ error: 'No products found for the category' });
        }

        res.render("home",{product,categories,brands,banners,loginData})
        

        
    } catch (error) {

        console.log(error.message)
        
    }
}


const contact= async(req,res)=>{

    try {

        const userId=req.session.userId
        const loginData = await User.findById(userId)


        res.render("contact",{loginData})
       

        
    } catch (error) {

        console.log(error.message)
        
    }
}





const sendMessage= async(req,res)=>{

    try {

        // Check if the user is logged in
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'You need to log in to send a message.' });
        }

        // Extract form data from the request body
        const { name, email, telephone, message } = req.body;

        // Create a new Contact instance
        const newContact = new Contact({
           name: name,
            email:email,
            phone:telephone,
            message:message,
           
        });

        // Save the contact message to the database
        await newContact.save();

        res.status(200).json({ message: 'Message sent successfully.' });

        







        
    } catch (error) {
        console.error(error.message)
        
    }
}







const addAddressInCheckout= async(req,res)=>{
    try {


        try {

            res.render("checkOutAddress")
            
        } catch (error) {
            console.log(error.message)
            
        }


        
    } catch (error) {
        console.error(error.message)
        
    }
}



const  createAddress2= async(req,res)=>{


    try {
        const userId=req.session.userId

        const{fname,lname,address,city,state,country,zipcode,mobile}=req.body

        const addressdata= new Address({

            userId:userId,
            first_name:fname,
            last_name: lname,
            address:address,
            city:city,
            state:state,
            country:country,
            zipcode:zipcode,
            mobile:mobile
        })

        const addressData= await addressdata.save()
        res.redirect('/checkOut')

             


    } catch (error) {
        console.log(error.message)
        
    }
}




const editUserProfile= async(req,res)=>{

    try {


        const userId = req.session.userId;

        
        console.log(req.body,userId)
        const userDetails = await User.findById(userId);

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { newUsername, newMobile } = req.body;

        // Validate newUsername and newMobile
        if (!newUsername || !newMobile) {
            return res.status(400).json({ error: 'New username and mobile number are required' });
        }

        // Check if the new values are different
        if (newUsername !== userDetails.name || newMobile !== userDetails.mobile) {
            userDetails.name = newUsername;
            userDetails.mobile = newMobile;

            await userDetails.save();

            // Send a success response as JSON
            return res.status(200).json({ message: 'Profile updated successfully' });
        }

        // If new values are the same, send a message indicating no changes were made
        return res.status(200).json({ message: 'No changes were made to the profile' });

        
    } catch (error) {
        console.error(error.message)
        
    }
}



const editAddress= async(req,res)=>{

    try {


        const userId= req.session.userId
        const id= req.query.id
        console.log("id",id)

        const address= await Address.findById(id)

        const loginData= await User.findById(userId)


        res.render("editAddress",{loginData,address})

        
    } catch (error) {

        console.log(error.message)
    }
}


const updateAddress= async(req,res)=>{


    try {


        const { fname, lname, address, city, state, zipcode, mobile } = req.body;
        const userId = req.session.userId; // Assuming you have the user ID in the session
        const id= req.query.id

        // Find the address to update
        const existingAddress = await Address.findById(id);

        console.log('----------------existingAddress',existingAddress);
        if (!existingAddress) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Update the address fields
        existingAddress.first_name = fname;
        existingAddress.last_name = lname;
        existingAddress.address = address;
        existingAddress.city = city;
        existingAddress.state = state;
        existingAddress.zipcode = zipcode;
        existingAddress.mobile = mobile;

        // Save the updated address
        await existingAddress.save();

        // Show success alert using SweetAlert
        res.status(200).json({ message: 'Address updated successfully' });



        
    } catch (error) {
        console.error(error.message)
        
    }
}











module.exports={
   loadHome,loadRegister,
   loadLogin,verifySignup,
   verifyLogin,
   verifyOtp,productDetails,
   getOtp,
   getForgotPassword,
   postForgotPassword,newOtp,
   verifyNewOtp,verifyPasswords,
   loadLogout,editProfile,updatePassword,
   userDash,addressForm,createAddress,
   invoiceShow,shop,
   filterProdutcs,sortBrand,
   contact,lowtohigh,hightoLow,addAddressInCheckout,
   createAddress2,atoz,ztoa,
   editUserProfile,editAddress,updateAddress,sendMessage
}