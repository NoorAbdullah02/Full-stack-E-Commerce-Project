const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
    getAllUsers,
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Import restrictTo

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), getAllUsers);

module.exports = router;
