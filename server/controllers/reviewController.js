const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { rating, title, comment, productId } = req.body;
        const userId = req.user.id;

        if (!rating || !comment || !productId) {
            return res.status(400).json({ message: 'Please provide rating, comment and product ID' });
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                productId
            }
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user verified purchase (optional logic, can be enhanced)
        const hasPurchased = await prisma.order.findFirst({
            where: {
                userId,
                status: 'DELIVERED', // Only delivered orders count as verified
                items: {
                    some: {
                        productId
                    }
                }
            }
        });

        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                title: title || '',
                comment,
                productId,
                userId,
                verified: !!hasPurchased
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        const total = await prisma.review.count({ where: { productId } });

        // Calculate average rating
        const aggregations = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        // Get rating distribution
        const distribution = await prisma.review.groupBy({
            by: ['rating'],
            where: { productId },
            _count: { rating: true },
        });

        // Format distribution object (1-5 stars)
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach(d => {
            ratingDistribution[d.rating] = d._count.rating;
        });

        res.json({
            reviews,
            page,
            pages: Math.ceil(total / limit),
            total,
            averageRating: aggregations._avg.rating || 0,
            totalReviews: aggregations._count.rating || 0,
            ratingDistribution
        });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;
        const reviewId = req.params.id;
        const userId = req.user.id;

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only owner can update
        if (review.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: rating ? Number(rating) : undefined,
                title,
                comment
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.json(updatedReview);
    } catch (error) {
        console.error('Update Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Owner or Admin can delete
        if (review.userId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await prisma.review.delete({
            where: { id: reviewId }
        });

        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markHelpful = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { type } = req.body; // 'helpful' or 'notHelpful'

        if (type !== 'helpful' && type !== 'notHelpful') {
            return res.status(400).json({ message: 'Invalid vote type' });
        }

        // Simplistic implementation: just increment counter. 
        // Real-world would track user votes to prevent duplicates/spam.
        const updateData = type === 'helpful'
            ? { helpful: { increment: 1 } }
            : { notHelpful: { increment: 1 } };

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: updateData
        });

        res.json(updatedReview);
    } catch (error) {
        console.error('Vote Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    markHelpful
};
