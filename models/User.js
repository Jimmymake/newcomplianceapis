import mongoose from "mongoose";



const signupSchema = new mongoose.Schema({
  role: String,
  merchantid: String,
  merchantIdAssignedAt: { type: Date, default: Date.now },
  onboardingStatus: {
    type: String,
    enum: ['in-progress', 'pending', 'approved', 'rejected'],
    default: 'in-progress'
  },

  onboardingSteps: {
    companyinformation: { companyName: String, fileUrl: String, completed: { type: Boolean, default: false } },
    ubo: { fullName: String, fileUrl: String, completed: { type: Boolean, default: false } },
    paymentandprosessing: { accountNumber: String, fileUrl: String, completed: { type: Boolean, default: false } },
    settlmentbankdetails: { bankName: String, fileUrl: String, completed: { type: Boolean, default: false } },
    riskmanagement: { riskAssessment: String, fileUrl: String, completed: { type: Boolean, default: false } },
    kycdocs: { docType: String, fileUrl: String, completed: { type: Boolean, default: false } }
  },

  fullname: String,
  email: { type: String, unique: true, required: true },
  phonenumber: { type: String, unique: true, required: true },
  location: String,
  password: String,



}, { timestamps: true, collection: "users" });


// function checkStepComplete(stepData) {
//   for (const key in stepData) {
//     if (key !== 'completed' && (!stepData[key] || stepData[key].trim() === '')) {
//       return false; // some field is empty
//     }
//   }
//   return true; // all fields filled
// }



// router.post("/:id/step/:stepName", upload.single("file"), async (req, res) => {
//   try {
//     const { id, stepName } = req.params;
//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Update step fields dynamically
//     Object.keys(req.body).forEach(key => {
//       user.onboardingSteps[stepName][key] = req.body[key];
//     });

//     // If file uploaded
//     if (req.file) {
//       user.onboardingSteps[stepName].fileUrl = req.file.path;
//     }

//     // Check if step is complete
//     user.onboardingSteps[stepName].completed = checkStepComplete(user.onboardingSteps[stepName]);

//     // Update overall status
//     const allSteps = Object.values(user.onboardingSteps);
//     user.onboardingStatus = allSteps.every(s => s.completed) ? "reviewed" : "in-progress";

//     await user.save();
//     res.json({ message: `Step ${stepName} updated`, step: user.onboardingSteps[stepName] });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating step", error: err.message });
//   }
// });





export default mongoose.model("Signup", signupSchema);