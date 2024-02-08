const session = require('express-session');
const User = require('../models/userModel')

// const isLogin=async(req,res)=>{
//     try {
//         if(req.session.userId){
//             next()
//         }else{
//             res.redirect('/login')
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// const isLogout=async(req,res)=>{
//     try {
//         if(req.session.userId){
//            res.redirect("/")
//         }else{
//             next()
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }

//    module.exports={
//     isLogin,
//     isLogout
// }

const isLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        } else {
            res.redirect('/login');
        }

    
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.userId) {
            res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const isBlocked = async(req,res,next)=>{
    try {
        const user =await User.findById(req.session.userId);
        if(user.is_active==1){
            res.redirect('/logout');
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    isBlocked
};
