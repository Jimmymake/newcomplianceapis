const mongoose = require('mongoose');

const prosessinginfor = new mongoose.Schema({
    requredcurrency: { KES: Boolean, USD: Boolean, GBP: Boolean, other: String },
    exmonthlytransaction: { amountinusd: Number, numberoftran: Number },
    avgtranssize: Number,
    paymentmethodtobesupported: {
        credit: Boolean,
        mobilemoney: Boolean,
        other: String
    },
    chargebackrefungrate: String



})