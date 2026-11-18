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
    sendCareReminder,
    getCareReminderCandidates,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), getOrders);

router.route('/myorders').get(protect, getMyOrders);

// Care Reminder routes (Must be before /:id)
router.route('/care-reminders/candidates')
    .get(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), getCareReminderCandidates);

router.route('/:id/care-reminder')
    .post(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), sendCareReminder);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/invoice').get(protect, downloadInvoice);

router.route('/:id/cancel').put(protect, cancelOrder);

router.route('/:id/status').put(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), updateOrderStatus);

module.exports = router;
