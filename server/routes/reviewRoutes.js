const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReview);

router.route('/product/:productId')
    .get(getProductReviews);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

router.route('/:id/helpful')
    .post(protect, markHelpful);

module.exports = router;
