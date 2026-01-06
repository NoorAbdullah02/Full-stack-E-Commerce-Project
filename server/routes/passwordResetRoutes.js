const express = require('express');
const {
    requestPasswordReset,
    verifyOTP,
    resetPassword
} = require('../controllers/passwordResetController');

const router = express.Router();

router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
