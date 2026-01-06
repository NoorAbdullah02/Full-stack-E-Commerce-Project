const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus,
    downloadInvoice,
    cancelOrder,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/invoice').get(protect, downloadInvoice);

router.route('/:id/cancel').put(protect, cancelOrder);

router.route('/:id/status').put(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), updateOrderStatus);

module.exports = router;
