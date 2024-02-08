
const Cart= require("../models/cartModel")
const Product=require("../models/productModel")
const User=require("../models/userModel")
const Address=require("../models/addressModel")
const Order=require("../models/orderModel")







const getCart= async(req,res)=>{


    try {

        const userId= req.session.userId


        const cartData= await Cart.findOne({userId:userId}).populate('products.productId')
        console.log('cart----------------------------------------------------------------');
        console.log(cartData.products[0])

        res.render("cart",{cartData})
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const addtoCart= async(req,res)=>{


    try {
        

             const{productId,quantity}=req.body
             const userId= req.session.userId
             console.log(quantity)

             let productData = await Product.findOne({_id:productId})
            //  let productData = await Product.findById({productId})
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
                    // If the product exists, update the quantity
                    existingProduct.quantity += quantity;
                } else {
                    // If the product doesn't exist, add a new entry
                    userCart.products.push({ productId, quantity });
                }

                // Save the updated cart to the database
                await userCart.save();

                // Send a success response
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
        console.log("-----req", req.body.productId);
        const userId = req.session.userId;

        let userCart = await Cart.findOne({ userId });

        if (!userCart) {
            console.log('User does not have a cart.');
            return res.status(404).json({ error: 'User does not have a cart' });
        }

        if (!userCart.products || !Array.isArray(userCart.products)) {
            console.log('User cart products array is missing or not an array.');
            return res.status(404).json({ error: 'User cart products array is missing or not an array' });
        }

        const indexToRemove = userCart.products.findIndex(product => product.productId == productId);

        console.log('index to rem'+indexToRemove);

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

        // Assuming you have a user session to get the userId
        const userId = req.session.userId;

        // Fetch the user's cart
        let userCart = await Cart.findOne({ userId:userId });
        console.log(",,,,,,,,,,,,,,,,,,",userCart)

        if (!userCart) {
            // Handle the case where the user does not have a cart
            console.log('User does not have a cart.');
            return res.status(404).json({ error: 'User does not have a cart' });
        }
           
        // Find the index of the product in the user's cart
        const productIndex = userCart.products.findIndex(product => product.productId.toString() === productId);
        console.log(productIndex);
        if (productIndex !== -1) {
            // Update the quantity based on the direction ('up' or 'down')
            if (direction === 'up') {
                userCart.products[productIndex].quantity++;
                console.log(userCart.products[productIndex].quantity);
            } else if (direction === 'down' && userCart.products[productIndex].quantity > 1) {
                userCart.products[productIndex].quantity--;
            }
            

           

            // Recalculate total price
            userCart.totalPrice = userCart.products.reduce((total, product) => {
                // Check if product and productId are defined
                if (product && product.productId) {
                     
                    const productTotal = product.quantity * product.productId.salesprice;
            
                    return total + productTotal;
                } else {
                    console.log('Invalid product or productId');
                    return total; // Skip invalid products in the calculation
                }
            }, 0);
            
            // Save the updated cart
            await userCart.save();
            
            console.log('Updated totalPrice:', userCart.totalPrice);
            
            // Send a response with the updated quantity and total price
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

        console.log("placed successfully")
        console.log("req.body",req.body)

        const userId=req.session.userId
        const addressData= await Address.find({_id:req.body.selectedAddress})
        const cartData= await Cart.find({userId:userId})
        console.log("addressData:",addressData)
        function generateOrderId() {
            const timestamp = Date.now(); // Get the current timestamp
            const randomNum = Math.floor(Math.random() * 10); // Generate a random number between 0 and 9999
        
            // Combine timestamp and random number to create a unique order ID
            const orderId = `ORD${timestamp}${randomNum}`;
        
            return orderId;
        }
        
        // Example usage
        const newOrderId = generateOrderId();
        console.log(newOrderId);

        const orderData= new Order({
            userId:req.session.userId,
            products:cartData.products,
            address:addressData[0],
            paymentMethod:req.body.paymentMethod,
            totalAmount:req.body.amount,
            orderId:newOrderId
        })

      const newOrder=  await orderData.save()

        console.log("orderData:",newOrder)
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


const cancelOrder= async(req,res)=>{
    try {

         console.log("order cancel entered")
        const userId= req.session.userId
        const orderId=req.query.id
        // const orderCancel=await Order.findByIdAndUpdate(userId,$set{is_cancelled:1})

        // const order = await Order.findByIdAndUpdate(userId, { $set: { is_cancelled: 1 } });
        const orderCancel = await Order.findByIdAndUpdate(orderId,{$set: {is_cancelled:1}})



       
       
        console.log("cancel Order::",orderCancel)

         res.redirect('/userDashboard')


    

        
    } catch (error) {
        console.log(error.message)
        
    }
}








module.exports={getCart,addtoCart,deleteIteminCart,updateitemQuantity,checkOut,placeOrder,cancelOrder}
