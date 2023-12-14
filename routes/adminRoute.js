
const express=require("express")
const session=require("express-session")
//const imageController= require('../controllers/imageController')
const admin_Route=express()
const multer=require('multer')
const upload=multer({dest:"uploads/"})


const adminController=require("../controllers/adminController")
const productController=require("../controllers/productController")

admin_Route.set("view engine",'ejs')
admin_Route.set('views',"./view/admin")


admin_Route.get("/",adminController.adminLogin)
admin_Route.get("/dashboard",adminController.getDashboard)
admin_Route.post("/dashboard",adminController.verifyAdmin)
admin_Route.get("/userlist",adminController.userList)

admin_Route.get("/blockuser",adminController.blockUser)
admin_Route.get("/unblockuser",adminController.unblockUser)



//....................Products.............................................



admin_Route.get("/addproduct",productController.addProduct)
admin_Route.post("/submitproducts",upload.array('image',5),productController.addnewProduct)
admin_Route.get("/productlist",productController.productList)
admin_Route.get("/editProduct",productController.editProductLoad)
admin_Route.post("/updateProduct",upload.array('image',5),productController.updateProduct)
admin_Route.get("/blockProduct",productController.blockProduct)
admin_Route.get("/unBlockProduct",productController.unblockProduct)
admin_Route.get('/categories',productController.getCatagories)
admin_Route.post('/addCatagory',productController.addCatagories)
admin_Route.get("/brand",productController.brand)
admin_Route.get("/addBrand",productController.addBrand)
admin_Route.post("/addNewBrand",upload.array('image',1),productController.addNewBrand)
admin_Route.get('/blockCategory',productController.blockCategory)
admin_Route.get('/unblockcategory',productController.unblockCategory)
admin_Route.get('/editCategory',productController.editCategoryLoad)
admin_Route.post('/updateCategory',productController.updateCategory)
admin_Route.get('/blockBrand',productController.blockBrand)
admin_Route.get('/unblockBrand',productController.unblockBrand)








module.exports=admin_Route