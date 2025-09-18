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

// ubos: [UboSchema],
//     paymentMethods: { cards: Boolean, mobileMoney: Boolean, other: [String] },
//     requiredCurrencies: [String],
//     expectedMonthlyVolumeUSD: Number,
//     expectedMonthlyTxCount: Number,
//     avgTxSizeUSD: Number,
//     chargebackRate: Number,
//     amlKycPolicy: { type: Boolean, default: false },
//     complianceOfficer: { fullName: String, phone: String, email: String },
//     regulatoryHistory: String,
//     pepDeclaration: { declaredNone: Boolean, declarationText: String },
//     documents: [{ filename: String, url: String }], // simple placeholder for uploaded docs


const mongoose = require("mongoose");


uboinfmodel = new mongoose.Schema([{
    fullname: String,
    nationality: String,
    residentialadress: String,
    persentageofownership: String,
    souceoffunds: [String],
    pep: Boolean

}, { timestamps: true }])