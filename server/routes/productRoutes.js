const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

router.route('/')
    .get(getProducts)
    .post(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), upload.array('images'), createProduct);

router.get('/categories', getCategories);

router.route('/:id')
    .get(getProductById)
    .put(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), updateProduct)
    .delete(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), deleteProduct);

module.exports = router;
