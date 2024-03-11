

const mongoose= require('mongoose')

const walletSchema= mongoose.Schema({

    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true },
    date: { type: Date, default: Date.now}

})



module.exports= mongoose.model("Wallet",walletSchema)