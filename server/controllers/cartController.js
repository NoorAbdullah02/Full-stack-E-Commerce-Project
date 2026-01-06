const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            // Return empty cart structure if no cart exists yet
            return res.status(200).json({
                items: []
            });
        }

        // Transform for frontend (flatten structure if needed, or keep as is)
        // Frontend expects: [{ productId, name, price, qty, image, ... }]
        // The API returns: { items: [ { product: {...}, quantity: 1 } ] }
        // We can map it here or in frontend. Let's map it here to match typical frontend expectations?
        // Actually, frontend 'cartItems' in cartSlice looks like: { productId, ... } (based on addToCart reducer)

        const formattedItems = cart.items.map(item => ({
            productId: item.componentId || item.productId, // Schema calls it productId
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0],
            stock: item.product.stock,
            qty: item.quantity,
            cartItemId: item.id // useful for removal
        }));

        res.json(formattedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    // quantity default 1
    const qty = quantity || 1;

    try {
        // 1. Get or Create Cart
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id }
            });
        }

        // 2. Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 3. Check if item exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        if (existingItem) {
            // Update quantity
            // Check stock?
            // For now, just update
            // STRICTLY ENFORCE LIMIT of 10
            const newQty = existingItem.quantity + qty;
            const finalQty = Math.min(10, newQty); // Clamp to 10

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: finalQty }
            });
        } else {
            // Create new item
            // LIMIT to 10
            const finalQty = Math.min(10, qty);

            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: finalQty
                }
            });
        }

        // Return updated cart
        // Re-use logic from getCart or just call it?
        // Hard to call via HTTP, just re-query.
        const updatedCart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const formattedItems = updatedCart.items.map(item => ({
            productId: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0],
            stock: item.product.stock,
            qty: item.quantity
        }));

        res.json(formattedItems);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update cart item quantity (Set explicit value)
// @route   PUT /api/cart/:id (id is productId)
// @access  Private
const updateCartItem = async (req, res) => {
    const { id } = req.params; // productId
    const { quantity } = req.body;

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Validate Quantity
        let newQty = parseInt(quantity);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        if (newQty > 10) newQty = 10; // Enforce max limit

        // Find the item
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: id
            }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQty }
            });
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const formattedItems = updatedCart.items.map(item => ({
            productId: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0],
            stock: item.product.stock,
            qty: item.quantity
        }));

        res.json(formattedItems);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id (id is productId)
// @access  Private
const removeFromCart = async (req, res) => {
    const { id } = req.params; // productId

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Delete based on productId AND cartId
        // First find the item id? Or use deleteMany (safe enough since cartId+productId should be unique conceptually)

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId: id
            }
        });

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const formattedItems = updatedCart.items.map(item => ({
            productId: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0],
            stock: item.product.stock,
            qty: item.quantity
        }));

        res.json(formattedItems);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
        }

        res.json([]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Sync Local Cart to Server
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
    const { items } = req.body; // Array of { productId, quantity }

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Invalid body' });
    }

    try {
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id }
            });
        }

        // For each item in local cart
        for (const item of items) {
            const existing = await prisma.cartItem.findFirst({
                where: { cartId: cart.id, productId: item.productId }
            });

            if (existing) {
                // Maybe keep the larger quantity? Or just assume local overrides?
                // Or add? "Sync" implies merging.
                // Let's assume we ADD local quantity to server if it exists, or just ensure it's there.
                // Simple approach: Local overwrites if new? 
                // Better: Max(local, server) or Server + Local.
                // Let's do: if exists, update quantity = existing.quantity.
                // Wait, usually 'sync' happens on login. 
                // Let's just Loop and Upsert-ish.
                // If I use "Add", I might double count if I sync twice.
                // Let's just ensure these items exist.
                // If exists, do nothing or update if local > server?
                // Let's just Add them up? No, that causes issues.
                // Let's Replace server with local? No, that deletes previous server items.
                // Strategy: Merge.

                // Strategy: 
                // 1. If server has it, update quantity = server.quantity + local.quantity
                // 2. If server doesn't, create it.
                // 3. Clear local.

                // BUT, user might just be calling this on every update? No, "Sync" is for login.

                await prisma.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + item.quantity }
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: item.productId,
                        quantity: item.quantity
                    }
                });
            }
        }

        // Return full cart
        const updatedCart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: { items: { include: { product: true } } }
        });

        const formattedItems = updatedCart.items.map(item => ({
            productId: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0],
            stock: item.product.stock,
            qty: item.quantity
        }));

        res.json(formattedItems);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart
};
