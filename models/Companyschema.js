

const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Bank subdocument schema
const bankSchema = new mongoose.Schema({
  id: Number, // numeric instead of ObjectId
  name: String,
  swift: String,
  jurisdiction: String,
  settlementCurrency: String
}, { _id: false }); // disable default _id

// TargetCountry subdocument schema
const targetCountrySchema = new mongoose.Schema({
  id: Number, // numeric instead of ObjectId
  region: String,
  percent: Number
}, { _id: false });

const companySchema = new mongoose.Schema({
  _id: Number, // company gets numeric ID too
  merchantid: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true },
  stepid: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  companyName: { type: String, required: true },
  merchantUrls: [String],
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
  banks: [bankSchema],
  targetCountries: [targetCountrySchema],
  topCountries: [String],
  previouslyUsedGateways: String,

}, { timestamps: true, _id: false });

// Auto-increment company _id
companySchema.plugin(AutoIncrement, { inc_field: '_id' });

// Auto-assign numeric IDs for subdocuments
companySchema.pre('save', function (next) {
  if (this.isModified('banks')) {
    this.banks.forEach((bank, index) => {
      if (!bank.id) bank.id = index + 1; // 1,2,3 inside each company
    });
  }
  if (this.isModified('targetCountries')) {
    this.targetCountries.forEach((tc, index) => {
      if (!tc.id) tc.id = index + 1;
    });
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
