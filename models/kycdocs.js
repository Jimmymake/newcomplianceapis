const mongoose = require("mongoose");


const kycdocs = new mongoose.Schema({


    certincorporation: String,
    cr2forpatnership:String,
    cr2forshareholders: String,
    kracert:String,
    bankstatement:String,
    passportids: String,
    shareholderpassportid: String,
    websiteipadress:[String],
    proofofbomain:String,
    proofofadress:String


})