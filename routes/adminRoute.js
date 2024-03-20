
const express=require("express")
const session=require("express-session")
//const imageController= require('../controllers/imageController')
const admin_Route=express()
const multer=require('multer')
const upload=multer({dest:"uploads"})


const adminController=require("../controllers/adminController")
const productController=require("../controllers/productController")
const adminAuth =require("../middleware/adminAuth")

admin_Route.set("view engine",'ejs')
admin_Route.set('views',"./view/admin")





admin_Route.get("/",adminAuth.isLogout,adminController.adminLogin)
admin_Route.get("/dashboard",adminAuth.isLogin,adminController.getDashboard)
admin_Route.post("/dashboard",adminController.verifyAdmin)
admin_Route.get("/userlist",adminAuth.isLogin,adminController.userList)
admin_Route.get("/blockuser",adminAuth.isLogin,adminController.blockUser)
admin_Route.get("/unblockuser",adminAuth.isLogin,adminController.unblockUser)
admin_Route.get('/logout',adminController.adminLogin)



//....................Products.............................................


admin_Route.delete("/deleteImage",adminAuth.isLogin,productController.deleteImage)
admin_Route.get("/addproduct",adminAuth.isLogin,productController.addProduct)
admin_Route.post("/submitproducts",adminAuth.isLogin,upload.array('image',5),productController.addnewProduct)
admin_Route.get("/productlist",adminAuth.isLogin,productController.productList)
admin_Route.get("/editProduct",adminAuth.isLogin,productController.editProductLoad)
admin_Route.post("/updateProduct",adminAuth.isLogin,upload.array('image',5),productController.updateProduct)
admin_Route.get("/blockProduct",adminAuth.isLogin,productController.blockProduct)
admin_Route.get("/unBlockProduct",adminAuth.isLogin,productController.unblockProduct)
admin_Route.get('/categories',adminAuth.isLogin,productController.getCatagories)
admin_Route.post('/addCatagory',adminAuth.isLogin,productController.addCatagories)
admin_Route.get("/brand",adminAuth.isLogin,productController.brand)
admin_Route.get("/addBrand",adminAuth.isLogin,productController.addBrand)
admin_Route.post("/addNewBrand",adminAuth.isLogin,upload.array('image',1),productController.addNewBrand)
admin_Route.get('/blockCategory',adminAuth.isLogin,productController.blockCategory)
admin_Route.get('/unblockcategory',adminAuth.isLogin,productController.unblockCategory)
admin_Route.get('/editCategory',adminAuth.isLogin,productController.editCategoryLoad)
admin_Route.post('/updateCategory',adminAuth.isLogin,productController.updateCategory)
admin_Route.get('/blockBrand',adminAuth.isLogin,productController.blockBrand)
admin_Route.get('/unblockBrand',adminAuth.isLogin,productController.unblockBrand)


//...................Orders......................................


admin_Route.get('/getOrders',adminAuth.isLogin,productController.getOrders)
admin_Route.get('/adminOrderpending',adminAuth.isLogin,productController.adminOrderPending)
admin_Route.get('/adminOrderShipped',adminAuth.isLogin,productController.adminOrderShipped)
admin_Route.get('/adminOrderDelivered',adminAuth.isLogin,productController.adminOrderDelivered)
admin_Route.get('/adminOrderCancelled',adminAuth.isLogin,productController.adminOrderCancelled)
admin_Route.get('/adminOrderReturned',adminAuth.isLogin,productController.adminOrderReturned)
admin_Route.get('/adminOrderdetails',adminAuth.isLogin,productController.orderDetails)


//......................report..............

admin_Route.get('/salesReport',adminAuth.isLogin,adminController.salesReport)
admin_Route.post('/salesreportsearch',adminAuth.isLogin,adminController.salesReportSearch)

admin_Route.get('/Coupons',adminAuth.isLogin,adminController.coupon)
admin_Route.post('/createCoupon',adminAuth.isLogin,adminController.createCoupon)
admin_Route.get('/blockCoupon',adminAuth.isLogin,adminController.blockCoupon)
admin_Route.get("/unblockCoupon",adminAuth.isLogin,adminController.unblockCoupon)
admin_Route.get('/getCoupon',adminAuth.isLogin,adminController.getCouponCode) 



// --------------banner------------------

admin_Route.get("/banner",adminAuth.isLogin,adminController.bannerPage)
admin_Route.post("/banner",adminAuth.isLogin,upload.array('image',1),adminController.addBanner)


<<<<<<< HEAD
// -------------offers-----------

admin_Route.get("/offers",adminAuth.isLogin,adminController.offers)
admin_Route.post("/applyOffer",adminAuth.isLogin,adminController.applyOffers)



=======
>>>>>>> a9e9b5889541a1e28216a8e038d5c0a9a857eff1

















module.exports=admin_Route