const mongoose = require('mongoose');

// const UboSchema = new mongoose.Schema({
//     fullName: String,
//     nationality: String,
//     dateOfBirth: Date,
//     residentialAddress: String,
//     percentageOwnership: Number,
//     sourceOfFunds: String,
//     isPEP: { type: Boolean, default: false },
//     pepDetails: String
// }, { _id: false });

const companyinformodel = new mongoose.Schema({
    companyName: { type: String, required: true },
    merchantUrls: [String],  //list of strigs
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
    banks: [{ name: String, swift: String, jurisdiction: String, settlementCurrency: String }],
    targetCountries: [{ region: String, percent: Number }],
    topCountries: [String],
    previouslyUsedGateways: String,
    
    // onboardingStatus: { type: String, enum: ['pending', 'reviewed', 'rejected', 'approved'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('companyinfor', companyinformodel);
