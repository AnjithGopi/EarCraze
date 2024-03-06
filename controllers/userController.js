

const User=require("../models/userModel")
const nodemailer=require('nodemailer')
const Product=require("../models/productModel")
const Address=require("../models/addressModel")
const Cart= require("../models/cartModel")
const Order= require("../models/orderModel")
const bcrypt= require('bcrypt')





const loadHome=async(req,res)=>{
    try {


        var search = ""
        if( req.body.search){
            search= req.body.search
        }

        const productData=await Product.find({is_active:0 , cat_status:0,brand_status:0,$or: [
            { title: { $regex: search, $options: 'i' } } 
        ]})
        const userId=req.session.userId;
        const loginData = await User.findById(userId)
        if(productData){
            // res.render("home",{product:productData})

            res.render("home",{product:productData,loginData})
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
                user: 'ng.anjith444@gmail.com',
               
                pass:'vqcm bgdj rmkp wfia'
            }
        });

        
        // =================   OTP  generation  =========================

        var randomotp=Math.floor(1000 + Math.random() * 9000).toString();
        req.session.otp=randomotp
        const {email,name}=req.session.data
        console.log(randomotp);
        const mailOptions = {
            from: 'ng.anjith444@gmail.com',
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
        const ptData= await Product.findOne({_id:id}).populate('brand')
     
        if(ptData){

            res.render("productDetails" ,{products:ptData})
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
                user: 'ng.anjith444@gmail.com',
              
                pass:'vqcm bgdj rmkp wfia'
            }
        });

        const userData=await User.findOne({email:req.session.email})

        
        // =================   OTP  generation  =========================//

        var randomotp=Math.floor(1000 + Math.random() * 9000).toString();
        req.session.passwordOtp=randomotp
       
        console.log(randomotp);
        const mailOptions = {
            from: 'ng.anjith444@gmail.com',
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

        
        const order= await Order.find({userId:userId}).sort({ orderDate:-1})
        res.render("userDashboard",{showAddress,userDetails,order})
        
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
            last_name: lname,
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



        res.render("editProfile")
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const  updateUserDetails= async(req,res)=>{

    try {


        // const userId= req.session.userId
        // const userData= await User.findById(userId)


        // const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // if(userData.name==req.body.name && userData.email==req.body.email && await bcrypt.compare(req.body.password, userData.password)){

        //    if(req.body.npassword==req.body.cpassword){

        //     const hashedNewPassword = await bcrypt.hash(req.body.npassword, 10);

        //     userData.password = hashedNewPassword;

        //    const newUserData= await userData.save()

        //    if(newUserData){
        //     const passwordChanged=true
        //    }

        //    if(passwordChanged){
        //     req.flash('success', 'Password changed successfully')
        //    }
         
        //     res.redirect("/")

        //    }else{

        //     res.render("editprofile",{message: "Passwords do not match"})

        //    }

        // }else{

        //     res.render("editprofile",{message:"Invalid Credentials"})
        // }


        const userId = req.session.userId;
        const userData = await User.findById(userId);

        if (!userData) {
            return res.status(404).send("User not found");
        }

        const passwordsMatch = await bcrypt.compare(req.body.password, userData.password);

        if (userData.name === req.body.name && userData.email === req.body.email && passwordsMatch) {
            if (req.body.newpassword === req.body.cpassword) {
                const hashedNewPassword = await bcrypt.hash(req.body.newpassword, 10);
                userData.password = hashedNewPassword;
                await userData.save();
                req.flash('success', 'Password changed successfully');
                return res.redirect("/");
            } else {
                return res.render("editprofile", { message: "Passwords do not match" });
            }
        } else {
            return res.render("editprofile", { message: "Invalid Credentials" });
        }




      
    } catch (error) {
        console.log(error.message)
        
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
   loadLogout,editProfile,updateUserDetails,
   userDash,addressForm,createAddress,
}