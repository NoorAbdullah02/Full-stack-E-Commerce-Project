const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateInvoicePDF } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');

// Helper function to generate beautiful order confirmation email
const generateOrderEmailHTML = (order, user) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    const deliveryDate = estimatedDelivery.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const statusColors = {
        PAID: '#10b981',
        PENDING: '#f59e0b',
        PROCESSING: '#3b82f6',
        SHIPPED: '#8b5cf6',
        ON_THE_WAY: '#06b6d4',
        DELIVERED: '#10b981',
        CANCELLED: '#ef4444'
    };

    const statusColor = statusColors[order.status] || '#6b7280';

    const itemsHTML = order.items.map(item => {
        const productName = item.product?.name || 'Product';
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 1;

        return `
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">${productName}</div>
                <div style="font-size: 13px; color: #6b7280;">Quantity: ${itemQty} × ৳${itemPrice.toFixed(2)}</div>
            </td>
            <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937;">
                ৳${(itemPrice * itemQty).toFixed(2)}
            </td>
        </tr>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                                <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #2563eb; line-height: 60px;">
                                    AI
                                </div>
                                <h1 style="color: #ffffff; margin: 0 0 10px; font-size: 32px; font-weight: 700;">Order Confirmed! 🎉</h1>
                                <p style="color: #e0e7ff; margin: 0; font-size: 16px;">Thank you for shopping with AI E-commerce</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                
                                <!-- Greeting -->
                                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 15px;">Hi ${user.name},</h2>
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                    Great news! We've received your order and it's being processed. You'll receive another email when your order ships. 
                                    Your detailed invoice is attached to this email for your records.
                                </p>
                                
                                <!-- Order Summary Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            
                                            <!-- Order Header -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                                                <tr>
                                                    <td>
                                                        <div style="font-size: 14px; color: #6b7280;">Order ID:</div>
                                                        <div style="font-weight: 700; color: #1f2937; font-size: 18px; margin-top: 5px;">#${order.id.slice(0, 8).toUpperCase()}</div>
                                                    </td>
                                                    <td align="right">
                                                        <span style="background-color: ${statusColor}; color: #ffffff; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                                            ${order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Order Details Grid -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                                <tr>
                                                    <td width="50%" style="padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                                                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Date</div>
                                                        <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${orderDate}</div>
                                                    </td>
                                                    <td width="10"></td>
                                                    <td width="50%" style="padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                                                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Total Items</div>
                                                        <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}</div>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            ${order.transactionId ? `
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                                <tr>
                                                    <td style="padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                                                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Transaction ID</div>
                                                        <div style="font-size: 14px; font-weight: 600; color: #1f2937; font-family: monospace;">${order.transactionId}</div>
                                                    </td>
                                                </tr>
                                            </table>
                                            ` : ''}
                                            
                                            <!-- Items List -->
                                            <div style="margin-top: 25px;">
                                                <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Order Items</div>
                                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
                                                    ${itemsHTML}
                                                </table>
                                            </div>
                                            
                                            <!-- Total Section -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border-radius: 10px; margin-top: 20px;">
                                                <tr>
                                                    <td style="padding: 20px;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="color: #e0e7ff; font-size: 14px; padding: 5px 0;">Subtotal</td>
                                                                <td align="right" style="color: #ffffff; font-size: 14px; font-weight: 500;">৳${Number(order.total).toFixed(2)}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="color: #e0e7ff; font-size: 14px; padding: 5px 0;">Shipping</td>
                                                                <td align="right" style="color: #ffffff; font-size: 14px; font-weight: 500;">FREE</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="color: #e0e7ff; font-size: 14px; padding: 5px 0;">Tax</td>
                                                                <td align="right" style="color: #ffffff; font-size: 14px; font-weight: 500;">৳0.00</td>
                                                            </tr>
                                                            <tr>
                                                                <td colspan="2" style="padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.3);"></td>
                                                            </tr>
                                                            <tr>
                                                                <td style="color: #ffffff; font-size: 20px; font-weight: 700; padding-top: 15px;">Total</td>
                                                                <td align="right" style="color: #ffffff; font-size: 26px; font-weight: 700; padding-top: 15px;">৳${Number(order.total).toFixed(2)}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Delivery Estimate -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 25px;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <div style="font-weight: 600; color: #065f46; margin-bottom: 8px; font-size: 15px;">📦 Estimated Delivery</div>
                                            <div style="color: #047857; font-size: 14px; line-height: 1.6;">
                                                Your order is expected to arrive by <strong>${deliveryDate}</strong>. 
                                                We'll send you tracking information once your package ships.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Customer Information -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 25px;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 10px;">Billing Information</div>
                                            <div style="font-size: 16px; color: #1f2937; font-weight: 600; margin-bottom: 8px;">${user.name}</div>
                                            <div style="font-size: 14px; color: #6b7280;">${user.email}</div>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Action Buttons -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="https://yourdomain.com/orders/${order.id}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 5px;">
                                                Track Your Order
                                            </a>
                                            <a href="https://yourdomain.com/account/orders" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 5px; border: 1px solid #e5e7eb;">
                                                View All Orders
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Help Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 25px;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <div style="font-weight: 600; color: #92400e; margin-bottom: 8px; font-size: 15px;">💡 Need Help?</div>
                                            <div style="color: #92400e; font-size: 14px; line-height: 1.6;">
                                                Questions about your order? Contact our support team at 
                                                <strong>noor@gmail.com</strong> or call us at 
                                                <strong>01748269350</strong>. We're here to help!
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                                <p style="color: #9ca3af; font-size: 14px; line-height: 1.8; margin: 0 0 15px;">
                                    <strong style="color: #ffffff;">AI E-commerce</strong><br>
                                    Kanaikhali, Natore, Bangladesh<br>
                                    noor@gmail.com | 01748269350
                                </p>
                                
                                <div style="margin: 20px 0;">
                                    <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px; font-size: 13px;">Facebook</a>
                                    <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px; font-size: 13px;">Instagram</a>
                                    <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px; font-size: 13px;">WhatsApp</a>
                                </div>
                                
                                <div style="border-top: 1px solid #374151; margin: 20px 0;"></div>
                                
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                    <a href="#" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a> | 
                                    <a href="#" style="color: #9ca3af; text-decoration: none;">Privacy Policy</a> | 
                                    <a href="#" style="color: #9ca3af; text-decoration: none;">Terms</a>
                                </p>
                                
                                <p style="color: #6b7280; font-size: 11px; margin: 15px 0 0;">
                                    © ${new Date().getFullYear()} AI E-commerce. All rights reserved.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, paymentMethod, transactionId, shippingAddress } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        // 0. Check Stock Availability & Calculate Real Total Price
        let calculatedTotal = 0;
        const processedItems = [];

        for (const item of orderItems) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }
            if (product.stock < (item.qty || item.quantity)) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }

            // Use DB price for security
            calculatedTotal += Number(product.price) * (item.qty || item.quantity);
            processedItems.push({
                productId: item.productId,
                quantity: item.qty || item.quantity,
                price: Number(product.price) // Store unit price at time of order
            });
        }

        // Add Shipping Cost (Standard logic: Inside/Outside Dhaka checked via frontend mostly but we can validate or just trust the standard addition if logic passed)
        // For strictness, let's assume the frontend passes the final total including shipping, 
        // OR we recalculate shipping based on address. 
        // Let's rely on the calculated subtotal + shipping derived logic if needed, 
        // but to minimize breakage let's stick to product total + shipping from frontend diff?
        // Actually, safer to trust the subtotal and just add the shipping cost the user agreed to? 
        // No, let's recalc shipping if possible or just use the subtotal verification.
        // Let's use the calculated subtotal and allow the 'totalPrice' from frontend to specify shipping choice difference,
        // or better yet, just add shipping based on city? 
        // Let's simplify: Real Product Total + (totalPrice - itemsTotal passed from front) = Secured Total?
        // To be safe and simple for now: We will use the calculated product prices. 
        // We will assume 100/150 shipping logic is handled by adding to this total.

        let shippingCost = 0;
        // Simple heuristic based on city matching 'Dhaka'? Or just trust the diff?
        // Let's blindly trust the shipping cost portion passed from frontend for now to avoid logic mismatch,
        // BUT we MUST ensure the product prices are correct.
        // processedTotal vs req.body.totalPrice

        // Better approach: Recalculate everything.
        const isDhaka = shippingAddress.city && shippingAddress.city.toLowerCase().includes('dhaka');
        shippingCost = isDhaka ? 100 : 150;

        // Tax 10%
        const tax = calculatedTotal * 0.1;

        const finalTotal = calculatedTotal + tax + shippingCost;

        // 1. Transaction: Create Order & Reduce Stock Atomically
        const order = await prisma.$transaction(async (tx) => {
            // Re-check stock inside transaction to prevent race conditions
            for (const item of processedItems) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }

                // Reduce Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Create Order
            const status = paymentMethod === 'Online Payment' ? 'PENDING' : 'PENDING';

            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.id,
                    status: status,
                    total: finalTotal,
                    transactionId: transactionId || null,
                    shippingAddress: shippingAddress,
                    items: {
                        create: processedItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    },
                    user: true
                }
            });

            return newOrder;
        });

        // Send response immediately to avoid UI hanging
        res.status(201).json(order);

        // 3. Generate Invoice PDF and Send Beautiful Email (Background Process)
        // We don't await this to keep the UI snappy.
        (async () => {
            try {
                // Log order data to debug
                console.log('📋 Order created with items:', JSON.stringify(order.items, null, 2));

                // Generate PDF Invoice
                const pdfBuffer = await generateInvoicePDF(order, req.user);
                const pdfBase64 = pdfBuffer.toString('base64');

                // Generate beautiful HTML email
                const emailHTML = generateOrderEmailHTML(order, req.user);

                // Send email with enhanced subject and beautiful template
                await sendEmail({
                    email: req.user.email,
                    subject: `🎉 Order Confirmation #${order.id.slice(0, 8).toUpperCase()} - AI E-commerce`,
                    htmlContent: emailHTML,
                    attachment: {
                        name: `Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`,
                        content: pdfBase64
                    }
                });

                // Store Invoice Record
                await prisma.invoice.create({
                    data: {
                        orderId: order.id
                    }
                });

                // Log successful email
                await prisma.emailLog.create({
                    data: {
                        userId: req.user.id,
                        type: 'ORDER_CONFIRMATION',
                        success: true,
                        sentAt: new Date()
                    }
                });

                console.log(`✅ Order confirmation email sent successfully to ${req.user.email}`);

            } catch (emailError) {
                console.error('❌ Invoice/Email generation failed:', emailError.message);
                console.error('Full error:', emailError);

                // Log failed email attempt
                try {
                    await prisma.emailLog.create({
                        data: {
                            userId: req.user.id,
                            type: 'ORDER_CONFIRMATION',
                            success: false,
                            sentAt: new Date()
                        }
                    });
                } catch (logError) {
                    console.error('Failed to log email error:', logError.message);
                }
            }
        })();

    } catch (error) {
        console.error('Order Controller Error:', error);
        res.status(500).json({
            message: 'Order processing failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error('Get My Orders Error:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            }
        });

        if (order) {
            if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || order.userId === req.user.id) {
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Get Order By ID Error:', error);
        res.status(500).json({ message: 'Error fetching order' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            }
        });

        // Send status update email for certain statuses
        if (['SHIPPED', 'DELIVERED'].includes(status)) {
            try {
                const statusMessages = {
                    SHIPPED: {
                        subject: `📦 Your Order #${order.id.slice(0, 8).toUpperCase()} Has Shipped!`,
                        message: 'Great news! Your order has been shipped and is on its way to you.',
                        icon: '📦'
                    },
                    DELIVERED: {
                        subject: `✅ Your Order #${order.id.slice(0, 8).toUpperCase()} Has Been Delivered!`,
                        message: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
                        icon: '✅'
                    }
                };

                const statusInfo = statusMessages[status];

                await sendEmail({
                    email: order.user.email,
                    subject: statusInfo.subject,
                    htmlContent: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
                                <h1>${statusInfo.icon} Order Update</h1>
                            </div>
                            <div style="padding: 30px; background-color: #f9fafb;">
                                <h2>Hi ${order.user.name},</h2>
                                <p style="font-size: 16px; color: #6b7280;">${statusInfo.message}</p>
                                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                                    <p><strong>Status:</strong> ${status}</p>
                                </div>
                                <a href="https://yourdomain.com/orders/${order.id}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Order</a>
                            </div>
                        </div>
                    `
                });

                console.log(`✅ Status update email sent to ${order.user.email}`);
            } catch (emailError) {
                console.error('❌ Status update email failed:', emailError.message);
            }
        }

        res.json(order);
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

// @desc    Download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && order.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to download this invoice' });
        }

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(order, order.user);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

        console.log(`✅ Invoice downloaded for order ${order.id}`);

    } catch (error) {
        console.error('Download Invoice Error:', error);
        res.status(500).json({ message: 'Error generating invoice', error: error.message });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Get order with items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization - user can only cancel their own orders, admins can cancel any
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && order.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled
        if (order.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        if (order.status === 'DELIVERED') {
            return res.status(400).json({ message: 'Cannot cancel a delivered order' });
        }

        // Use transaction to update order status and restore stock atomically
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Restore stock for all items
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
                console.log(`✅ Restored ${item.quantity} units of ${item.product.name}`);
            }

            // Update order status to CANCELLED
            const cancelled = await tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
                include: {
                    user: true,
                    items: {
                        include: { product: true }
                    }
                }
            });

            return cancelled;
        });

        // Send cancellation email
        try {
            await sendEmail({
                email: updatedOrder.user.email,
                subject: `Order Cancellation Confirmed - #${updatedOrder.id.slice(0, 8).toUpperCase()}`,
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; color: white;">
                            <h1>❌ Order Cancelled</h1>
                        </div>
                        <div style="padding: 30px; background-color: #f9fafb;">
                            <h2>Hi ${updatedOrder.user.name},</h2>
                            <p style="font-size: 16px; color: #6b7280;">Your order has been successfully cancelled.</p>
                            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Order ID:</strong> #${updatedOrder.id.slice(0, 8).toUpperCase()}</p>
                                <p><strong>Status:</strong> CANCELLED</p>
                                <p><strong>Refund:</strong> If you paid online, your refund will be processed within 5-7 business days.</p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">If you have any questions, please contact our support team.</p>
                        </div>
                        <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                            <p>AI E-commerce | noor@gmail.com | 01748269350</p>
                        </div>
                    </div>
                `
            });
            console.log(`✅ Cancellation email sent to ${updatedOrder.user.email}`);
        } catch (emailError) {
            console.error('❌ Cancellation email failed:', emailError.message);
        }

        res.json({
            message: 'Order cancelled successfully',
            order: updatedOrder
        });

        console.log(`✅ Order ${orderId} cancelled successfully`);

    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({
            message: 'Error cancelling order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus,
    downloadInvoice,
    cancelOrder,
};