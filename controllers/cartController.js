
const Cart= require("../models/cartModel")
const Product=require("../models/productModel")
const User=require("../models/userModel")
const Address=require("../models/addressModel")
const Order=require("../models/orderModel")
const WishList= require('../models/wishListModel')

const Razorpay=require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_HLFENnvKhWUWjZ',
    key_secret: 'SQd2IeNenul5pBC1TWPUXiVx',
  });






const getCart= async(req,res)=>{


    try {

        const userId= req.session.userId


        const cartData= await Cart.findOne({userId:userId}).populate('products.productId')
       
        res.render("cart",{cartData})




        
    } catch (error) {
        console.log(error.message)
        
    }
}


const addtoCart= async(req,res)=>{


    try {
        
    
             const{productId,quantity}=req.body
             const userId= req.session.userId
             console.log(quantity,productId)
             
             let productData = await Product.findOne({_id:productId})
            
            console.log("Product Data :",productData)

            if(quantity <= productData.quantity) {

            
                    let userCart= await Cart.findOne({userId})
                    if(!userCart){
                        userCart= new Cart({
                            userId:userId,
                            products:[]
                        })
                    }
 
                    
                
                    const existingProduct = userCart.products.find(product => product.productId == productId);

                    console.log("exising product")
                    console.log(existingProduct)

                if (existingProduct) {
                    
                    existingProduct.quantity += quantity;
                } else {
                    
                    userCart.products.push({ productId, quantity });
                }

                
                await userCart.save();

                
                res.status(201).json({ success:true, message: 'Item added to cart successfully' });
            } else {
                console.log('OUT OF STOCK')
                res.status(200).json({ success:false, message: 'Out of stock' });

            }
        

    
    } catch (error) {
        console.log(error.message)
        
    }
}



const deleteIteminCart= async(req,res)=>{

    try {
        
        const { productId, quantity } = req.body;
       
        const userId = req.session.userId;

        let userCart = await Cart.findOne({ userId });

        if (!userCart) {
           
            return res.status(404).json({ error: 'User does not have a cart' });
        }

        if (!userCart.products || !Array.isArray(userCart.products)) {
           
            return res.status(404).json({ error: 'User cart products array is missing or not an array' });
        }

        const indexToRemove = userCart.products.findIndex(product => product.productId == productId);

       

        if (indexToRemove !== -1) {
            userCart.products.splice(indexToRemove, 1);

            await userCart.save();
           res.status(200).json({message:'success'})
        } else {
            console.log('Item not found in the cart.');
            return res.status(404).json({ error: 'Item not found in the cart' });
        }



        
    } catch (error) {
        console.log(error.message)
        
    }
}


const updateitemQuantity= async(req,res)=>{
    try {

        const { productId, direction } = req.body;
        const userId = req.session.userId;
        let userCart = await Cart.findOne({ userId:userId });
       

        if (!userCart) {
            return res.status(404).json({ error: 'User does not have a cart' });
        }
           
        
        const productIndex = userCart.products.findIndex(product => product.productId.toString() === productId);
   
        if (productIndex !== -1) {
           
            if (direction === 'up') {
                userCart.products[productIndex].quantity++;
                console.log(userCart.products[productIndex].quantity);
            } else if (direction === 'down' && userCart.products[productIndex].quantity > 1) {
                userCart.products[productIndex].quantity--;
            }
            

            userCart.totalPrice = userCart.products.reduce((total, product) => {
               
                if (product && product.productId) {
                     
                    const productTotal = product.quantity * product.productId.salesprice;
            
                    return total + productTotal;
                } else {
                    console.log('Invalid product or productId');
                    return total; 
                }
            }, 0);
            
            await userCart.save();
            
            res.json({
                quantity: userCart.products[productIndex].quantity,
                totalPrice: userCart.totalPrice,
            });
        } else {
            console.log('Item not found in the cart.');
            return res.status(404).json({ error: 'Item not found in the cart' });
        }

        
        
    } catch (error) {
        console.log(error.message)
        
    }
}




const searchInCart= async(req,res)=>{
    try {
        const userId = req.session.userId;
        const searchTerm = req.query.term; 
       
        console.log(searchTerm +"teerm");
        
       
        const cart = await Cart.findOne({ userId }).populate('products.productId');
      
       
        var matchingProducts = cart.products.filter(item => {
           
            const product = item.productId;
            
            return product.title.toLowerCase().includes(searchTerm.toLowerCase());
        });

        console.log("matching",matchingProducts)
  
       
        res.json(matchingProducts);
    } catch (error) {
       
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


        
}



const checkOut= async(req,res)=>{

    try {

        const userId=req.session.userId
        const addressData= await Address.find({userId:userId})
        const cartData= await Cart.findOne({userId:userId}).populate("products.productId")



        res.render("checkOut",{addressData,cartData})
        
    } catch (error) {
        console.log(error.message)
        
    }
}



const placeOrder= async(req,res)=>{
    try {

       

        const userId=req.session.userId
        const addressData= await Address.find({_id:req.body.selectedAddress})
        const cartData= await Cart.findOne({userId:userId})
        console.log("addressData:",addressData)


       

        function generateOrderId() {
            const timestamp = Date.now().toString(); 
            const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
            let orderId = 'ORD'; 
            
           
            while (orderId.length < 6) {
                const randomIndex = Math.floor(Math.random() * randomChars.length);
                orderId += randomChars.charAt(randomIndex);
            }
            
            return orderId + timestamp.slice(-6); 
        }
        
        
        
        const newOrderId = generateOrderId();
        

        const orderData= new Order({
            userId:req.session.userId,
            products:cartData.products,
            address:addressData[0],
            paymentMethod:req.body.paymentMethod,
            totalAmount:req.body.amount,
            orderId:newOrderId
        })

        

      const newOrder=  await orderData.save()

        
        if(newOrder){
            const result = await Cart.updateOne(
                {userId:userId},
                {
                  $unset: {
                    products: 1,
                  },
                }
              );
        }
       

       


        res.status(200).json({message:'success'})



        
    } catch (error) {
        console.log(error.message)
        
    }
}






const onlinePayment = async (req, res) => {
    try {
       

        const userId = req.session.userId
        const addressData = await Address.find({ _id: req.body.selectedAddress })
        const cartData = await Cart.findOne({ userId: userId })
        const userData= await User.findById(userId)
       

        function generateOrderId() {
            const timestamp = Date.now().toString(); 
            const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
            let orderId = 'ORD'; 
            
           
            while (orderId.length < 6) {
                const randomIndex = Math.floor(Math.random() * randomChars.length);
                orderId += randomChars.charAt(randomIndex);
            }
            
            return orderId + timestamp.slice(-6); 
        }
        const newOrderId = generateOrderId();
       






        var options = {
            amount: req.body.amount, 
            currency: "INR",
            receipt: "order_rcptid_11"
        };

        instance.orders.create(options,async function (err, razOrder) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to create Razorpay order" });
                return;
            }
            console.log(razOrder);

            

            const orderData= new Order({
                userId:req.session.userId,
                products:cartData.products,
                address:addressData[0],
                paymentMethod:req.body.paymentMethod,
                paymentStatus:'Recieved',
                totalAmount:req.body.amount,
                orderId:newOrderId,
                razOrderId:razOrder.id
            })
        
            
        
          const newOrder=  await orderData.save()
        
          if(newOrder){
            const result = await Cart.updateOne(
                {userId:userId},
                {
                  $unset: {
                    products: 1,
                  },
                }
              );
        }
          res.status(200).json({ message: "Order placed successfully", razOrder });
        
          





            //.........................

          
       
    });



  
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}








const userOrderCancel= async(req,res)=>{
    try {

         console.log("order cancel entered")
        const userId= req.session.userId
        const orderId=req.query.id
       
        const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {orderStatus:'Cancelled'}})



       
       
        console.log("cancel Order::",orderCancel)

         res.redirect('/userDashboard')


    

        
    } catch (error) {
        console.log(error.message)
        
    }
}


const userOrderReturn= async(req,res)=>{
    try {

        console.log("order return entered")
        const userId= req.session.userId
        const orderId=req.query.id
       
        const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {orderStatus:'Returned'}})

        res.redirect("/userDashboard")





        
    } catch (error) {
        console.log(error.message)
        
    }
}



const userOrderDetails= async(req,res)=>{
    try {


        console.log("user Order details")

        const orderId= req.query.id

        const orderDetails= await Order.findById(orderId).populate('userId').populate('products.productId')

        res.render("userOrderdetails",{orderDetails})

        
    } catch (error) {
        console.log(error.message)
        
    }
}




const getWishlist= async(req,res)=>{
    try {

        const userId= req.session.userId


        const wishListData= await WishList.findOne({userId:userId}).populate('products.productId')
        console.log('wishList----------------------------------------------------------------' ,userId);
       

        res.render("wishList",{wishListData})


        
    } catch (error) {
        console.log(error.message)
        
    }
}




const addtoWishList= async(req,res)=>{



    try {
        const { productId } = req.body;
        const userId = req.session.userId; 
       
        const wishlist = await WishList.findOne({ userId });
        if (!wishlist) {
            
            const newWishlist = new WishList({
                userId,
                products: [{ productId }]
            });
            await newWishlist.save();
        } else {
            
            if (!wishlist.products.some(product => product.productId.equals(productId))) {
                wishlist.products.push({ productId });
                await wishlist.save();
            }
        }

        
        res.json({ success: true, message: 'Product added to wishlist successfully' });
    } catch (error) {
    
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }



}

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userId; 

        
        const wishlist = await WishList.findOne({ userId });

        
        if (wishlist) {
            wishlist.products = wishlist.products.filter(product => !product.productId.equals(productId));
            await wishlist.save();
            res.json({ success: true, message: 'Product removed from wishlist successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Wishlist not found' });
        }
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};






        












module.exports={getCart,addtoCart,deleteIteminCart,updateitemQuantity,
    checkOut,placeOrder,onlinePayment,userOrderCancel,userOrderReturn,
    userOrderDetails,getWishlist,addtoWishList,removeFromWishlist,searchInCart}  
