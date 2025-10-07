

import mongoose from 'mongoose';

const companyinfo = new mongoose.Schema({
  stepid: { type: Number, default: 1 },
  merchantid: { type: String, required: true },
  completed: { type: Boolean, default: false },
  companyName: { type: String, required: true },
  merchantUrls: String,
  dateOfIncorporation: Date,
  incorporationNumber: String,
  countryOfIncorporation: String,
  companyEmail: String,
  contactPerson: {
    fullName: String,
    phone: String,
    email: String
  },
  businessDescription: String,
  sourceOfFunds: String,
  purpose: String,
  licensingRequired: { type: Boolean, default: false },
  licenseInfo: {
    licencenumber: String,
    licencetype: String,
    jurisdiction: String
  },
  bankname: String,
  swiftcode: String,
  targetCountries: [{
    region: String,
    percent: Number
  }],
  topCountries: [String],
  previouslyUsedGateways: String,

}, { timestamps: true, collection: "companyinfo" });




export default  mongoose.model('companyinfo', companyinfo);


