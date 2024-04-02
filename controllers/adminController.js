
const User=require("../models/userModel")
const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const Brand=require("../models/brandModel")
const Order= require('../models/orderModel')
const Coupon=require('../models/couponModel')
const Banner= require("../models/bannerModel")



const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4: uuidv4 } = require("uuid")
const sharp= require('sharp')
const path = require('path');
const filePath = path.join(__dirname, 'sales-report.pdf');
const cron = require('node-cron');


const adminLogin= async(req,res)=>{

    try {
      
        console.log("admin Login")
        res.render("adminlogin")


        
    } catch (error) {
        console.log(error.message);
        
    }



}

const getDashboard=async(req,res)=>{
    try {
        const orderList= await Order.find().sort({orderDate:-1}).populate('userId')
        const totalOrders= await Order.find().populate('userId')
        const totalProducts= await Product.find()
        const categories= await Category.find()
        const brands= await Brand.find()
        const salesData= await Order.find({ paymentStatus: 'Recieved', orderStatus: 'Delivered' }).sort({orderDate:-1}).populate('userId')


        // most ordered Products

        const mostOrderedProducts = await Order.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } }, // Populate product details
            { $unwind: "$product" },
            { $project: { _id: "$product._id", title: "$product.title", totalQuantity: 1 } }
        ]).limit(10);


        //  top selling categories


        const topSellingCategories = await Order.aggregate([
            { $unwind: "$products" },
            { $lookup: { from: "products", localField: "products.productId", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $group: { _id: "$product.category", totalQuantity: { $sum: "$products.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $project: { categoryName: "$category.name", totalQuantity: 1 } }
        ]).limit(10);


        // Fetch top selling brands

        
        const topSellingBrands = await Order.aggregate([
            { $unwind: "$products" },
            { $lookup: { from: "products", localField: "products.productId", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $group: { _id: "$product.brand", totalQuantity: { $sum: "$products.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "brand" } },
            { $unwind: "$brand" },
            { $project: { brandName: "$brand.name", totalQuantity: 1 } }
        ]).limit(10);

    
        // mostOrderedProducts will contain an array of objects, each containing _id (productId) and totalQuantity
        console.log("Most ordered products:", mostOrderedProducts);
        console.log("Top selling Categories:",topSellingCategories)
        console.log("top selling Brands:", topSellingBrands)


        // >>>>>>>>>>>>>>>......Chart......>>>>>>>>>>>>>>>>>>>>>>>>>>

        // Fetch orders that are delivered and payment is received
        const deliveredOrders = await Order.find({
            orderStatus: 'Delivered',
            paymentStatus: 'Recieved'
        });

        // Aggregate monthly sales data
        const monthlySalesData = new Array(12).fill(0); // Initialize array with zeros for each month
        deliveredOrders.forEach(order => {
            const monthIndex = new Date(order.orderDate).getMonth(); // Get month index (0-11)
            monthlySalesData[monthIndex] += parseFloat(order.totalAmount); // Add order amount to corresponding month
        });


        



        res.render("dashboard",{orderList,totalOrders,totalProducts,mostOrderedProducts,topSellingCategories,topSellingBrands,categories,brands,salesData,
            monthlySalesData: JSON.stringify(monthlySalesData),
            })
        
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
                    req.session.adminId=adminData._id

                    console.log("Dashboard rendered")

                    res.redirect("/admin/dashboard")
                }
           
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
        const userData= await User.find({is_admin:0}).sort({date:-1})

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
             

              res.redirect("/admin/userlist")
              console.log("user Blocked")
        
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
       
        res.redirect("/admin/userlist")    

    } catch (error) {
        console.log(error.message)
        
    }
}

const adminLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const salesReport= async(req,res)=>{
    try {


        const orderList= await Order.find({ paymentStatus: 'Recieved', orderStatus: 'Delivered' }).sort({orderDate:-1}).populate('userId')

        res.render('salesReport',{orderList})
     


    } catch (error) {
        console.log(error.message)
        
    }
}



const salesReportSearch= async(req,res)=>{

    try {

        

        const { start, end } = req.body; 
        const endOfDay = new Date(end);
         endOfDay.setHours(23, 59, 59, 999);
       
        const orderList = await Order.find({
            paymentStatus: 'Recieved', orderStatus: 'Delivered',
            orderDate: { $gte: new Date(start), $lte: endOfDay }
        }).populate('userId');

       
        res.render('salesReport', { orderList,start,end }); 

        
    } catch (error) {
        console.log(error.message)
        
    }
}



const coupon= async(req,res)=>{
    try {


        const coupons= await Coupon.find().sort({_id:-1})
        res.render("coupon",{coupons})
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const createCoupon= async(req,res)=>{
    try {
       
       



        const { name, code, discountpercentage, minimumAmount, validUntil } = req.body;

    // Validate inputs
    if (!name || !code || !discountpercentage || !minimumAmount || !validUntil) {
      return res.status(400).send('All fields are required.');
    }

    // Check if coupon with the same name or code already exists
    const existingCoupon = await Coupon.findOne({ $or: [{ name }, { code }] });
    if (existingCoupon) {
      return res.status(400).send('Coupon with the same name or code already exists.');
    }

    // Create a new coupon
    const newCoupon = new Coupon({
      name,
      code,
      discountpercentage,
      minimumAmount,
      validUntil,
    });

    // Save the coupon to the database
    await newCoupon.save();
    res.status(201).send('Coupon created successfully.');


      } catch (error) {
        
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }





    const blockCoupon= async(req,res)=>{
        try {

            const couponId= req.query.id

            const updatedCoupon= await Coupon.findByIdAndUpdate(couponId,{is_active:false})
            await updatedCoupon.save()

            res.redirect("/admin/Coupons")



            
        } catch (error) {
            console.log(error.message)
            
        }
    }



    const unblockCoupon= async(req,res)=>{


        try {
            const couponId= req.query.id

        const updatedCoupon= await Coupon.findByIdAndUpdate(couponId,{is_active:true})

        await updatedCoupon.save()

        res.redirect("/admin/Coupons")
            
        } catch (error) {

            console.log(error.message)
            
        }


        

    }


    const getCouponCode= async(req,res)=>{
        try {
            const couponId = req.query.couponId;
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ error: 'Coupon not found' });
            }
            res.json({ code: coupon.code });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }



    const bannerPage= async(req,res)=>{
        try {

            res.render("addBanner")
            
        } catch (error) {
            console.log(error.message)
            
        }
    }



    const addBanner= async(req,res)=>{
        try {

            const processedImages = req.processedImages || [];

            const{bname,bDescription,start,end}=req.body
    
    
            const bannerData= new Banner({

                name:bname,
                description:bDescription,
                startDate:start,
                endDate:end,
                image:req.files.map((file)=>file.path),
               
            })
            const banner=await bannerData.save()
            console.log("banners:",banner)
            // res.redirect("/admin/addproduct")
            
            if(banner){
               res.status(200).json({success:true,message:'Banner added successfully '})
          
            } else{
                res.json({success:false})
            }




            
        } catch (error) {
            console.log(error.message)
            
        }
    }



    const deleteExpiredBanners= async(req,res)=>{


        try {

            
        const expiredBanners = await Banner.find({ endDate: { $lte: new Date() } });

        
        await Banner.deleteMany({ _id: { $in: expiredBanners.map(banner => banner._id) } });

        console.log('Expired banners deleted successfully.');

        res.redirect("/home")
            
        } catch (error) {
            console.log(error.message)
            
        }
    }

        // Schedule the task to run every day at midnight (0:0:0)
         cron.schedule('0 0 * * *', deleteExpiredBanners);



    const offers= async(req,res)=>{
        try {

            const categories= await Category.find()

            res.render("offers",{categories})
            
        } catch (error) {
            console.log(error.message)
            
        }
    }




    const applyOffers= async(req,res)=>{


        try {

            const { categoryId, discount, expiry } = req.body;

            const updatedCategory = await Category.findByIdAndUpdate(

              categoryId,
              { offerPercent: discount, expiry: expiry, offerActive: true },
              { new: true } 
            );

            if (!updatedCategory) {
              return res.status(404).json({ message: 'Category not found' });
            }

            const productsToUpdate = await Product.find({ category: categoryId });

           
            for (const product of productsToUpdate) {
            const updatedPrice = product.salesprice * ((100 - discount) / 100);
            product.salesprice = updatedPrice;
            await product.save();
           }

            res.status(200).json({ message: 'Offer applied successfully', category: updatedCategory });
            
        } catch (error) {
            console.log(error.message)
            
        }
    }


     
    const checkAndResetExpiredOffers = async () => {
        try {
        
        const expiredCategories = await Category.find({ expiry: { $lte: new Date() }, offerActive: true });

        for (const category of expiredCategories) {
          
            category.offerPercent = 0;
            category.expiry = null;
            category.offerActive = false;
            await category.save();

           
            const productsToUpdate = await Product.find({ category: category._id });
            for (const product of productsToUpdate) {
                product.salesprice = product.regularprice;
                await product.save();
            }
        }

            console.log('Expired offers checked and reset successfully.');

            
        } catch (error) {
         console.error('Error checking and resetting expired offers:', error);
       }
   };

    // Schedule the task to run every day at midnight (0:0:0)
     cron.schedule('0 0 * * *', checkAndResetExpiredOffers);




     const salesData= async(req,res)=>{


        try {

           const salesData = await Order.aggregate([
                {
                  $match: {
                    orderStatus: 'Delivered', // Filter by order status
                    paymentStatus: 'Received' // Filter by payment status
                  }
                },
                {
                  $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
                    totalSales: { $sum: '$totalAmount' }
                  }
                }
              ]);


              console.log("salesData:",salesData)
            //   res.json(salesData);





            
        } catch (error) {
            console.error(error.message)
            
        }
     }











module.exports={
    adminLogin,verifyAdmin,userList,blockUser,
    unblockUser,getDashboard,adminLogout,salesReport,
    salesReportSearch,coupon,createCoupon,blockCoupon, 
    unblockCoupon,getCouponCode,bannerPage,addBanner,offers,applyOffers,
    deleteExpiredBanners,salesData,
}