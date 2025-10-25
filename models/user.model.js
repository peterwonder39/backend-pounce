const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    type: { type: String, required: true }, 
    amount: { type: Number, required: true },
    desc: { type: String },
    date: { type: String },

})

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    accountNumber: { type: String, unique: true },
    balance: { type: Number, default: 150000 },
    transactions: [transactionSchema],

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
