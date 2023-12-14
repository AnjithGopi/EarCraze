

const User=require("../models/userModel")
const nodemailer=require('nodemailer')
const Product=require("../models/productModel")
const bcrypt= require('bcrypt')




const loadHome=async(req,res)=>{
    try {

        const productData=await Product.find({is_active:0 , cat_status:0,brand_status:0})
        if(productData){
            res.render("home",{product:productData})
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
        
        
        res.render('login')
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
           

            console.log(data)
            req.session.data=data
            console.log(req.session.data)
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
                pass: 'dpnb bzyd gxpa eahu'
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
            // subject: `Hello ${req.body.name}`,
            // text: `Your verification OTP is ${randomotp}`
            
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
        // res.status(200).json({success:true})
        
        
            // res.render("registration",{message:"invalid details"})

    
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

                // req.session.registrationSuccess=true;
               
             res.json(   {
                    "success": true,
                    "message": "OTP verification successful",
                    // additional data, if needed
                  }
             )
                //  res.redirect('/login')
                // res.json({success:true})
                // res.render('login',{registrationSuccess:res.locals.registrationSuccess})
     
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
        console.log(req.body.email)

        const loginData= await User.findOne({email:req.body.email})
            if(loginData){
                if(req.body.email==loginData.email) {
                    const isMatch=await bcrypt.compare(req.body.password,loginData.password)

               
                if(isMatch){
                    
                        const productData=await Product.find({is_active:0})
                        console.log(productData)
                        if(productData){
                            res.render("home",{product:productData,loginData})
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
        console.log(ptData)
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
        console.log(verifyEmail)
        console.log(req.body.email)
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
                pass: 'dpnb bzyd gxpa eahu'
            }
        });

        const userData=await User.findOne({email:req.session.email})

        
        // =================   OTP  generation  =========================

        var randomotp=Math.floor(1000 + Math.random() * 9000).toString();
        // req.session.otp=randomotp
        // const {email,name}=req.session.data
        console.log(randomotp);
        const mailOptions = {
            from: 'ng.anjith444@gmail.com',
            to: req.session.email,
            subject: `Hello ${userData.name}`,
            text: `Your verification OTP is ${randomotp}`
            // subject: `Hello ${req.body.name}`,
            // text: `Your verification OTP is ${randomotp}`
            
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

const passwordForm =async(req,res)=>{
    try {
        res.render("newPassword.ejs")


        
    } catch (error) {
        console.log(error.message)
        
    }
}

const setNewPassword= async(req,res)=>{
    try {
        


        
    } catch (error) {
        console.log(error.message)
        
    }
}










module.exports={
   loadHome,loadRegister,loadLogin,verifySignup,verifyLogin,verifyOtp,productDetails,getOtp,getForgotPassword,postForgotPassword,newOtp,passwordForm
}