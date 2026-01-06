const express = require('express');
const router = express.Router();
const { chatWithAI, generateDescription } = require('../controllers/aiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/chat', chatWithAI);
router.post('/generate-description', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), generateDescription);

module.exports = router;
