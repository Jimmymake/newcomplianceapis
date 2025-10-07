import mongoose from "mongoose";

const riskmanagementinfo = new mongoose.Schema({
    stepid: { type: Number, default: 5 },
    merchantid: { type: String, required: true },
    completed: { type: Boolean, default: false },

    amlpolicy: Boolean,
    officerdetails: {
        fullname: String,
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




}, { timestamps: true, collection: "riskmanagementinfo" })

export default mongoose.model('riskmanagementinfo', riskmanagementinfo);