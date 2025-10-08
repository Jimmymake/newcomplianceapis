import mongoose from "mongoose";


const kycdocs = new mongoose.Schema({

    stepid: { type: Number, default: 6 },
    merchantid: String,
    completed: { type: Boolean, default: false },
    certincorporation: String,
    cr2forpatnership: String,
    cr2forshareholders: String,
    kracert: String,
    bankstatement: String,
    passportids: String,
    shareholderpassportid: String,
    websiteipadress: [String],
    proofofbomain: String,
    proofofadress: String,
    pepform: String


}, { timestamps: true, collection: "kycdocs" })


export default mongoose.model("kycdocs", kycdocs);