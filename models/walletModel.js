

const mongoose= require('mongoose')

const walletSchema= mongoose.Schema({

    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: true, default: 0 },
   
    currency: { type: String, required: true },
    transactionHistory: [
        {
            date: { type: Date, default: Date.now },
            type: { type: String, enum: ['Credit', 'Debit'], required: true },
            amount: { type: Number, required: true }
        }
    ],
    date: { type: Date, default: Date.now}

})



module.exports= mongoose.model("Wallet",walletSchema)