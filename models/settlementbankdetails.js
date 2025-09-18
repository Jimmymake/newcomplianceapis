const mongoose = require("mongoose");

const complianceriskmanagement = new mongoose.Schema({

    amlpolicy: Boolean,
    officerdetails: {
        fullnamr: String,
        telephonenumber: String,
        email: String
    },
    historyofregulatoryfine: Boolean,
    hereaboutus: String,
    indroducer: {
        name: String,
        position: String,
        date: Date,
        signature: String
    }



})