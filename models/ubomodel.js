import mongoose from "mongoose";

const uboSchema = new mongoose.Schema({
  fullname: String,
  nationality: String,
  residentialadress: String,
  persentageofownership: String,
  souceoffunds:String,
  pep: Boolean,
  pepdetails: String
}, { _id: false });

const uboinfor = new mongoose.Schema({
  stepid: { type: Number, default: 2 },
  merchantid: { type: String, required: true },
  completed: { type: Boolean, default: false },
  ubo: [uboSchema]
}, { timestamps: true, collection: "uboinfor" });

export default mongoose.model("uboinfor", uboinfor);
// export default UboInfo;
