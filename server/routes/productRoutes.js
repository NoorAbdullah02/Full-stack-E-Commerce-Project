const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

router.route('/')
    .get(getProducts)
    .post(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), upload.array('images'), createProduct);
// .post(upload.array('images'), createProduct); // TEMPORARY DEBUG: Auth disabled

router.route('/categories')
    .get(getCategories)
    .post(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), createCategory);

router.route('/:id')
    .get(getProductById)
    .put(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), upload.array('images'), updateProduct)
    .delete(protect, restrictTo('ADMIN', 'SUPER_ADMIN'), deleteProduct);

module.exports = router;
