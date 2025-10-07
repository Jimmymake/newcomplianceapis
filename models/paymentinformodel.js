// const mongoose = require('mongoose');
import mongoose from "mongoose";

const paymentinfo = new mongoose.Schema({
    stepid: { type: Number, default: 3 },
    merchantid: String,
    completed: { type: Boolean, default: false },
    requredcurrency: { KES: Boolean, USD: Boolean, GBP: Boolean, other: String },
    exmonthlytransaction: { amountinusd: Number, numberoftran: Number },
    avgtranssize: Number,
    paymentmethodtobesupported: {
        credit: Boolean,
        mobilemoney: Boolean,
        other: String
    },
    chargebackrefungrate: String

}, { timestamps: true, collection: "paymentinfo" })


// export default  mongoose.model("paymentinfo", paymentinfo)
const PaymentInfo =mongoose.model("paymentinfo", paymentinfo)
export default PaymentInfo;