// const express = require('express');
// const app = express();

// // Middleware to read JSON body
// app.use(express.json());

// // CREATE merchant
// app.post('/api/merchants', (req, res) => {
//   const data = req.body;
//   res.send(`Merchant ${data.companyName} created!`);
// });

// // READ all merchants
// app.get('/api/merchants', (req, res) => {
//   res.send("Here is the list of merchants");
// });

// // READ one merchant
// app.get('/api/merchants/:id', (req, res) => {
//   res.send(`Details for merchant with id ${req.params.id}`);
// });

// // UPDATE merchant
// app.put('/api/merchants/:id', (req, res) => {
//   res.send(`Merchant ${req.params.id} updated`);
// });

// // DELETE merchant
// app.delete('/api/merchants/:id', (req, res) => {
//   res.send(`Merchant ${req.params.id} deleted`);
// });

// app.listen(4000, () => console.log("http://localhost:4000/"));


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const companyinfor = require('./routes/companyinfor');
const app = express();



// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });




// Routes
app.get('/', (req, res) => res.send('Merchant API is running'));

app.use('/api/companyinfor', companyinfor);

//routes end here



// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
