
const User=require("../models/userModel")
const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")



const adminLogin= async(req,res)=>{

    try {
      
        
        res.render("adminlogin")


        
    } catch (error) {
        console.log(error.message);
        
    }



}

const getDashboard=async(req,res)=>{
    try {

        res.render("dashboard")
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const verifyAdmin= async(req,res)=>{

    try{

        const adminData= await User.findOne({email:req.body.email})
        if(adminData){

            if(adminData.email==req.body.email && adminData.password==req.body.password){
                if(adminData.is_admin==1){
                    console.log("Dashboard rendered")
                    res.render("dashboard")
                }
            //     }else{
            //         res.render("adminlogin",{message:"Access Denied"})
            //     }
            // }else{
            //     res.render("adminlogin",{message:"Access Denied"})
            // }
            }else{
                res.render("adminlogin",{message:"Access Denied"})

        }
        }
        

    }catch(error){
        console.log(error.message)
    }
    
}


const userList= async(req,res)=>{
    try {
        const userData= await User.find({is_admin:0})

        res.render("userlist",{users:userData})
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const blockUser= async(req,res)=>{

    try {
        const userId=req.query.id
        const userData=await User.findByIdAndUpdate(userId,{is_active:1})
             await userData.save()

              const users=await User.find({is_admin:0})

        res.render("userlist",{message:"user Blocked",users})
        
    } catch (error) {

        console.log(error.message)
        
    }

}

const unblockUser=async(req,res)=>{
    try {
        
        const userId=req.query.id
        const userData=await User.findByIdAndUpdate(userId,{is_active:0})
        await userData.save()


        const users=await User.find({is_admin:0})
        res.render("userlist",{message:"user Unblocked",users})



    } catch (error) {
        console.log(error.message)
        
    }
}






module.exports={
    adminLogin,verifyAdmin,userList,blockUser,unblockUser,getDashboard,
}