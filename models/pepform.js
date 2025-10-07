import mongoose from "mongoose";


const pepforminfo = new mongoose.Schema({
    stepid: { type: Number, default: 7 },
    merchantid: { type: String, required: true },
    completed: { type: Boolean, default: false },
    pepform: String

}, { timestamps: true, collection: "pepform" })

export default mongoose.model("pepforminfo", pepforminfo)