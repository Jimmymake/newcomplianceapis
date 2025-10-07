import mongoose from 'mongoose';


const settlementbankdetail = new mongoose.Schema({
    nameofbank: String,
    swiftcode: String,
    jurisdiction: String,
    settlementcurrency: String
},{_id: false})


const settlementbankdinfo = new mongoose.Schema({
    stepid: { type: Number, default: 4 },
    merchantid: { type: String, required: true },
    completed: { type: Boolean, default: false },
    settlementbankdetail: [settlementbankdetail]
}, { timestamps: true, collection: "settlementbankdinfo" })


export default mongoose.model('settlementbankdinfo', settlementbankdinfo);