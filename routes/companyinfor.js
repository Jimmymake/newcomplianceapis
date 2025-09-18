const express = require('express');
const router = express.Router();
const companySchema = require('../models/Companyschema');

// Create merchant (POST /api/merchants)
router.post('/', async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) return res.status(400).json({ error: 'companyName is required' });

    const merchant = new companySchema(req.body);
    await merchant.save();
    res.status(201).json(merchant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List merchants (GET /api/merchants)
router.get('/list', async (req, res) => {
  try {
    const merchants = await companySchema.find().sort({ createdAt: -1 }).limit(100);
    res.json(merchants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single merchant (GET /api/merchants/:id)
router.get('/:id', async (req, res) => {
  try {
    const merchant = await companySchema.findById(req.params.id);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
    res.json(merchant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update merchant (PUT /api/merchants/:id)
router.put('/:id', async (req, res) => {
  try {
    const updated = await companySchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Merchant not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete merchant (DELETE /api/merchants/:id)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await companySchema.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    res.json({ message: 'Merchant deleted successfully', deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});





module.exports = router;