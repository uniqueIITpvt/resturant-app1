const express = require('express');
const router = express.Router();
const helcimController = require('../controllers/helcim.controller');

// Initialize payment session
router.post('/initialize', helcimController.initializePayment);

// Process direct purchase
router.post('/purchase', helcimController.processPurchase);

// Check payment status
router.get('/status/:helcimPayId', helcimController.checkPaymentStatus);

// Verify HelcimPay.js payment
router.post('/verify', helcimController.verifyHelcimPayment);

module.exports = router;
