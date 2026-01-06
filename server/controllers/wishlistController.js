const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        // If no wishlist exists, return empty items
        res.json(wishlist ? wishlist.items : []);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if wishlist exists
        let wishlist = await prisma.wishlist.findUnique({
            where: { userId: req.user.id }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId: req.user.id }
            });
        }

        // Check if item already exists
        const exists = await prisma.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId
            }
        });

        if (exists) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId
            }
        });

        res.status(201).json({ message: 'Product added to wishlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: req.user.id }
        });

        if (!wishlist) {
            return res.status(200).json({ message: 'Wishlist empty or not found' });
        }

        // Delete using deleteMany to avoid errors if item doesn't exist
        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId: req.params.productId
            }
        });

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
