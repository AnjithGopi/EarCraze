
const Cart= require("../models/cartModel")
const Product=require("../models/productModel")
const User=require("../models/userModel")
const Address=require("../models/addressModel")
const Order=require("../models/orderModel")
const WishList= require('../models/wishListModel')
const Coupon= require('../models/couponModel')
const Wallet= require("../models/walletModel")

const Razorpay=require('razorpay')

var instance = new Razorpay({
    key_id: process.env.KEYID,
    key_secret: process.env.KEYSECRET,
  });






const getCart= async(req,res)=>{


    try {

        const userId= req.session.userId

        const loginData = await User.findById(userId)


        const cartData= await Cart.findOne({userId:userId}).populate('products.productId')
       
        res.render("cart",{cartData,loginData})




        
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

        

        // >>>>>>>>>>>>>Again UPDATED <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<



        const { productId, direction } = req.body;
        const userId = req.session.userId;
        
        // Find the user's cart and populate the products with their details
        let userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        
        if (!userCart) {
            return res.status(404).json({ error: 'User does not have a cart' });
        }

        const productIndex = userCart.products.findIndex(product => product.productId._id.toString() === productId);
        if (productIndex !== -1) {
            const product = userCart.products[productIndex].productId;
            
            // Check if the requested quantity update is valid based on available stock
            if (direction === 'up') {
                if (userCart.products[productIndex].quantity < product.quantity) {
                    userCart.products[productIndex].quantity++;
                } else {
                    return res.json({ error: 'Item is out of stock' });
                }
            } else if (direction === 'down' && userCart.products[productIndex].quantity > 1) {
                userCart.products[productIndex].quantity--;
            }

            // Update totalPrice
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
        const loginData=await User.findById(userId)
        const addressData= await Address.find({userId:userId})
        const cartData= await Cart.findOne({userId:userId}).populate("products.productId")
        const coupons= await Coupon.find({is_active:true})
        



        res.render("checkOut",{addressData,cartData,coupons,loginData})
        
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
        console.log("amount:",req.body.amount)

        // Check if the cart is empty
        
        if (!cartData || cartData.products.length == 0) {
            return res.status(400).json();
        }

        if(parseInt(req.body.amount)>1000){
            
            res.status(400).json()
        }else{

        


       

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
            couponDiscount:req.body.couponDiscount,
            orderId:newOrderId
        })

        

      const newOrder=  await orderData.save()

    

        // Update product quantities
       for (const item of cartData.products) {
        const product = await Product.findById(item.productId);
        product.quantity -= item.quantity;
        await product.save();
        }

        
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


    }
        
    } catch (error) {
        console.log(error.message)
        
    }
}






const changeStatus = async(req,res)=>{
    try {
          const id = req.query.id
         console.log("id...........",id);
         if(id){
            console.log('insideeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
            const updatedOrder = await Order.findByIdAndUpdate(id, { paymentStatus: 'failed' });
    if (updatedOrder) {
        res.redirect('/')
    } 
}    
    } catch (error) {
        console.log(error.message);
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
                couponDiscount:req.body.couponDiscount,
                orderId:newOrderId,
                razOrderId:razOrder.id
            })
        
            
        
          const newOrder=  await orderData.save()


          
          // Update product quantities

          for (const item of cartData.products) {
          const product = await Product.findById(item.productId);
          product.quantity -= item.quantity;
          await product.save();
          }



          const id = newOrder._id;
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
          res.status(200).json({ message: "Order placed successfully", razOrder,id});
        
          





            //.........................

          
       
    });

         
  
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}





const placeOrderWallet = async (req, res) => {
    try {

        const userId = req.session.userId;
        const addressId = req.body.selectedAddress;
        const paymentMethod = req.body.paymentMethod;
        const amount = req.body.amount;
        const couponDiscount = req.body.couponDiscount;

        const userWallet = await Wallet.findOne({ user_id: userId });

        if (!userWallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const cartData = await Cart.findOne({ userId: userId }).populate('products.productId');
        if (!cartData || cartData.products.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        if (userWallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        userWallet.balance -= amount;
        await userWallet.save();

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
        const orderId = generateOrderId();

        const addressData = await Address.findById(addressId);
        if (!addressData) {
            return res.status(404).json({ error: 'Address not found' });
        }

        const newOrder = new Order({
            userId: userId,
            products: cartData.products.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
            })),
            address: addressData,
            paymentMethod: paymentMethod,
            totalAmount: amount,
            paymentStatus:'Recieved',
            couponDiscount: couponDiscount,
            orderId: orderId,
        });
        await newOrder.save();






        for (const item of cartData.products) {
            const product = await Product.findById(item.productId._id);
            if (product) {
                product.quantity -= item.quantity;
                await product.save();
            }
        }

        await Cart.updateOne({ userId: userId }, { $unset: { products: 1 } });

        res.status(200).json({ message: 'Order placed successfully', orderId: newOrder._id });
        
       
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};








const userOrderCancel= async(req,res)=>{
    try {

        //  console.log("order cancel entered")
        // const userId= req.session.userId
        // const orderId=req.query.id
        // const cartData = await Cart.findOne({ userId: userId }).populate('products.productId');
       
        // const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {orderStatus:'Cancelled'}})

       
        // console.log("cancel Order::",orderCancel)

        //  res.redirect('/userDashboard')


        //  <<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>




        console.log("Order cancel entered");

        const userId = req.session.userId;
        const orderId = req.query.id;

         // Fetch the order to be canceled
          const order = await Order.findById(orderId).populate('products.productId');

            if (!order) {
      return res.status(404).json({ message: "Order not found" });
     }

       // Change the order status to "Cancelled"
     order.orderStatus = 'Cancelled';
     await order.save();

      // Retrieve the products from the canceled order
      const productsToRestore = order.products;

      // Increment the quantity of each product back based on the canceled order
     for (const item of productsToRestore) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
     }

    console.log("Cancel Order:", order);

    res.redirect('/userDashboard');




        // <<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>




    

        
    } catch (error) {
        console.log(error.message)
        
    }
}


const userOrderReturn= async(req,res)=>{
    try {

        // console.log("order return entered")
        // const userId= req.session.userId
        // const orderId=req.query.id


        
        // const order = await Order.findById(orderId);

       
        // if (!order || order.userId.toString() !== userId) {
        //     return res.status(404).send("Order not found");
        // }



      
        // const refundedAmount = parseFloat(order.totalAmount) 


        
        // let wallet = await Wallet.findOne({ user_id: userId });
        // if (wallet) {
        //     wallet.balance += refundedAmount;
        //     await wallet.save();
        // } else {
          
        //     wallet = await Wallet.create({
        //         user_id: userId,
        //         balance: refundedAmount,
        //         currency: "INR", 
                
                
        //     });
        // }

        

        // const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {orderStatus:'Returned'}})

        // res.redirect("/userDashboard")




        // <<<<<<<<<<<<<<<<UPDATED CODE>>>>>>>>>>>>>>>>>>>


        console.log("Order return entered");
    const userId = req.session.userId;
    const orderId = req.query.id;

    // Retrieve order details including products
    const order = await Order.findById(orderId).populate('products.productId');

    // Ensure the order belongs to the current user
    if (!order || order.userId.toString() !== userId) {
      return res.status(404).send("Order not found");
    }

    // Update product quantities and calculate refunded amount
    let refundedAmount = 0;
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity += item.quantity;
        refundedAmount += item.quantity * product.salesprice; // Assuming salesprice is used for calculation
        await product.save();
      }
    }

    // Update user's wallet balance
    let wallet = await Wallet.findOne({ user_id: userId });
    if (wallet) {
      wallet.balance += refundedAmount;
      await wallet.save();
    } else {
      // If the wallet doesn't exist, create a new one for the user
      wallet = await Wallet.create({
        user_id: userId,
        balance: refundedAmount,
        currency: "INR", // You may want to change this based on your currency system
      });
    }

    // Change order status to "Returned"
    const orderReturn = await Order.findByIdAndUpdate(orderId, { $set: { orderStatus: 'Returned' } });

    res.redirect("/userDashboard");



        




        
    } catch (error) {
        console.log(error.message)
        
    }
}



const walletDetails= async(req,res)=>{
    try {

        const userId = req.session.userId
        const wallet = await Wallet.findOne({ user_id: userId });
        if (wallet) {
            res.json({ balance: wallet.balance });
        } else {
            res.status(404).json({ error: 'Wallet not found' });
        }
        
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
        const loginData = await User.findById(userId)


        const wishListData= await WishList.findOne({userId:userId}).populate('products.productId')
       
       

        res.render("wishList",{wishListData,loginData})


        
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



const applyCoupon= async(req,res)=>{


    try {

         // Get the coupon ID from the request body
         const { couponId } = req.body;
         console.log(req.body)
         const userId= req.session.userId

         const cartData= await Cart.findOne({userId:userId}).populate('products.productId')
         console.log("cartData:",cartData)

         var total=0
         cartData.products.forEach((cart)=>{

             total+=cart.productId.salesprice*cart.quantity
         })
         console.log("newTotal:",total)


         // Check if the coupon with the given ID exists
         const coupon = await Coupon.findById(couponId);
         console.log('coupon :',coupon)

         if (!coupon) {
             return res.status(404).json({ error: 'Coupon not found' });
         }

         
         if(total<coupon.minimumAmount){
            return res.json({ success :false, message:"Coupon Cannot be applied"})    
         }


         // Check if the user has already redeemed the coupon
         const redeemedCoupon = coupon.redemptionHistory.find(history => history.userId === userId);
         if (redeemedCoupon) {
            return res.json({ success: false, message: "Coupon already redeemed" });
         }



         // Add the user to the redemption history array in the coupon document
           coupon.redemptionHistory.push({ userId: userId, usedOn: new Date() });

         // Save the updated coupon document
         await coupon.save();



        

         // Calculate the discount amount based on the coupon's discount percentage
         const discountAmount = (total * coupon.discountpercentage) / 100;

    
         // Subtract the discount amount from the total amount
         const grandTotal = total - discountAmount;

        
   

         // Prepare the response with the updated grand total and coupon details
       

         res.json({success: true, message: 'Coupon applied successfully',coupon,grandTotal,discountAmount});

        
    } catch (error) {
        console.log(error.message)
        
    }
}






        












module.exports={getCart,addtoCart,deleteIteminCart,updateitemQuantity,
    checkOut,placeOrder,onlinePayment,userOrderCancel,userOrderReturn,applyCoupon,
    userOrderDetails,getWishlist,addtoWishList,removeFromWishlist,searchInCart,changeStatus,walletDetails,placeOrderWallet}  
