const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary from buffer with organized folder structure and smart dimension fitting
const uploadToCloudinary = (buffer, subfolder = 'products', options = {}) => {
    return new Promise((resolve, reject) => {
        const baseFolder = process.env.CLOUDINARY_FOLDER || 'green_petals';
        const targetFolder = `${baseFolder}/${subfolder}`;

        let width = 800;
        let height = 800;
        if (options.aspectRatio === '4:5') {
            width = 800;
            height = 1000;
        } else if (options.aspectRatio === '16:9') {
            width = 1200;
            height = 675;
        } else if (options.aspectRatio === '3:4') {
            width = 750;
            height = 1000;
        }

        const cropType = options.fitMode === 'pad' ? 'pad' : 'fill';
        const transformation = [
            {
                width,
                height,
                crop: cropType,
                gravity: cropType === 'fill' ? 'auto' : undefined,
                background: cropType === 'pad' ? 'white' : undefined,
                quality: 'auto:good',
                fetch_format: 'auto'
            }
        ];

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: targetFolder,
                resource_type: 'image',
                transformation
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    console.log('GET /api/products called with query:', req.query);
    try {
        const { keyword, pageNumber, category, minPrice, maxPrice, sort } = req.query;

        // Build filter object
        const where = {};

        // Search
        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { category: { name: { contains: keyword, mode: 'insensitive' } } },
            ];
        }

        // Category
        if (category) {
            where.categoryId = category;
        }

        // Price Range
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }

        // Sorting
        let orderBy = { createdAt: 'desc' }; // Default
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'newest') orderBy = { createdAt: 'desc' };
        else if (sort === 'name_asc') orderBy = { name: 'asc' };

        const pageSize = 8; // 8 items per page for clean balanced mobile & desktop grid
        const page = Number(pageNumber) || 1;

        const count = await prisma.product.count({ where: { ...where, isDeleted: false } });
        const products = await prisma.product.findMany({
            where: {
                ...where,
                isDeleted: false
            },
            orderBy,
            include: { category: true },
            take: pageSize,
            skip: pageSize * (page - 1),
        });

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    console.log('GET /api/products/categories called');
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        console.log('Categories found:', categories.length);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new category
// @route   POST /api/products/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const trimmedName = name.trim();
        const existing = await prisma.category.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: 'insensitive'
                }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await prisma.category.create({
            data: { name: trimmedName }
        });

        console.log(`✅ Created new category: ${category.name}`);
        res.status(201).json(category);
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: 'Error creating category' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { reviews: { include: { user: true } } },
        });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, description, categoryId, stock } = req.body;

        const uploadOptions = {
            aspectRatio: req.body.aspectRatio || '1:1',
            fitMode: req.body.fitMode || 'fill'
        };

        // Handle image upload
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, 'products', uploadOptions);
                imageUrls.push(result.secure_url);
            }
        } else if (req.body.imageUrl) {
            imageUrls.push(req.body.imageUrl);
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: Number(price),
                originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
                discount: req.body.discount ? Number(req.body.discount) : null,
                description,
                categoryId,
                stock: Number(stock),
                images: imageUrls,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create product' });
    }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, categoryId, stock } = req.body;
        // Check if we need to update images.
        // Logic: 
        // 1. If new files are uploaded -> Upload and replace/append? 
        //    Current simple logic: Replace all images with new ones if uploaded.
        // 2. If no new files -> Keep existing?

        let imageUrls = undefined; // undefined means "do not update" in Prisma
        const uploadOptions = {
            aspectRatio: req.body.aspectRatio || '1:1',
            fitMode: req.body.fitMode || 'fill'
        };

        if (req.files && req.files.length > 0) {
            imageUrls = [];
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, 'products', uploadOptions);
                imageUrls.push(result.secure_url);
            }
        } else if (req.body.imageUrl) {
            imageUrls = [req.body.imageUrl];
        }

        // Construct update data
        const updateData = {
            name,
            price: Number(price),
            originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
            discount: req.body.discount ? Number(req.body.discount) : null,
            description,
            categoryId,
            stock: Number(stock),
        };

        // Only add images to updateData if we have new ones
        if (imageUrls) {
            updateData.images = imageUrls;
        }

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.json(product);
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ message: 'Failed to update product' }); // Changed status code to 500 for generic server errors, 404 handled by Prisma usually but 'where' check implies it exists? 
        // Actually, let's keep the error handling robust.
    }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        await prisma.product.update({
            where: { id: req.params.id },
            data: { isDeleted: true }
        });
        res.json({ message: 'Product removed' });
    } catch (error) {
        // P2025 is "Record to update does not exist"
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.error('Delete Product Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
};
