const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, user) => {
    return new Promise((resolve, reject) => {
        try {
            // Log received data for debugging
            console.log('🔍 PDF Generation - Order ID:', order.id);
            console.log('🔍 PDF Generation - Items count:', order.items?.length || 0);
            console.log('🔍 PDF Generation - First item:', order.items?.[0]);

            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Colors
            const primaryColor = '#2563eb';
            const accentColor = '#3b82f6';
            const darkGray = '#1f314aff';
            const mediumGray = '#6b7280';
            const lightGray = '#f3f4f6';
            const successGreen = '#10b981';

            // Helper function to draw rounded rectangle
            const drawRoundedRect = (x, y, width, height, radius) => {
                doc.roundedRect(x, y, width, height, radius);
            };

            // ========== HEADER SECTION ==========
            // Company brand bar with gradient effect
            doc.rect(0, 0, 612, 120).fill(primaryColor);
            doc.rect(0, 100, 612, 20).fillOpacity(0.3).fill(accentColor).fillOpacity(1);

            // Company logo placeholder (circle)
            doc.circle(70, 60, 25).fill('#ffffff');
            doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold')
                .text('AI', 58, 52);

            // Company name and tagline
            doc.fillColor('#ffffff')
                .fontSize(24)
                .font('Helvetica-Bold')
                .text('AI E-commerce', 110, 45);

            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#e0e7ff')
                .text('Your Trusted Shopping Partner', 110, 72);

            // Company contact info (right aligned)
            doc.fontSize(9)
                .fillColor('#ffffff')
                .text('Kanaikhali, Natore, Bangladesh', 400, 45, { align: 'right', width: 150 })
                .text('noor@gmail.com', 400, 58, { align: 'right', width: 150 })
                .text('01748269350', 400, 71, { align: 'right', width: 150 });

            // ========== INVOICE TITLE ==========
            doc.fillColor(darkGray)
                .fontSize(28)
                .font('Helvetica-Bold')
                .text('INVOICE', 50, 150);

            // Status badge
            const statusColors = {
                PAID: successGreen,
                PENDING: '#f59e0b',
                PROCESSING: '#3b82f6',
                SHIPPED: '#8b5cf6',
                ON_THE_WAY: '#06b6d4',
                DELIVERED: successGreen,
                CANCELLED: '#ef4444'
            };

            const statusColor = statusColors[order.status] || mediumGray;
            const statusX = 450;
            const statusY = 155;

            drawRoundedRect(statusX, statusY, 100, 25, 5);
            doc.fillOpacity(0.2).fill(statusColor).fillOpacity(1);

            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor(statusColor)
                .text(order.status, statusX, statusY + 8, { width: 100, align: 'center' });

            // ========== INVOICE INFO BOXES ==========
            const boxY = 200;

            // Invoice details box
            drawRoundedRect(50, boxY, 240, 100, 8);
            doc.lineWidth(0.5).strokeColor(mediumGray).fillColor(lightGray).fillAndStroke();

            doc.fillColor(mediumGray)
                .fontSize(9)
                .font('Helvetica')
                .text('INVOICE NUMBER', 65, boxY + 15);

            doc.fillColor(darkGray)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(`INV-${order.id.slice(0, 8).toUpperCase()}`, 65, boxY + 32);

            doc.fillColor(mediumGray)
                .fontSize(9)
                .font('Helvetica')
                .text('INVOICE DATE', 65, boxY + 55);

            doc.fillColor(darkGray)
                .fontSize(11)
                .text(new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }), 65, boxY + 72);

            // Customer details box
            drawRoundedRect(310, boxY, 240, 100, 8);
            doc.lineWidth(0.5).strokeColor(mediumGray).fillColor(lightGray).fillAndStroke();

            doc.fillColor(mediumGray)
                .fontSize(9)
                .font('Helvetica')
                .text('BILL TO', 325, boxY + 15);

            doc.fillColor(darkGray)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(user.name || 'Customer', 325, boxY + 32, { width: 210 });

            doc.fillColor(mediumGray)
                .fontSize(10)
                .font('Helvetica')
                .text(user.email || '', 325, boxY + 52, { width: 210 });

            // Transaction ID if exists
            if (order.transactionId) {
                doc.fontSize(8)
                    .text(`TXN: ${order.transactionId.slice(0, 20)}`, 325, boxY + 75, { width: 210 });
            }

            // ========== ITEMS TABLE ==========
            const tableTop = 340;

            // Table header background
            drawRoundedRect(50, tableTop, 500, 30, 5);
            doc.fill(primaryColor);

            // Table headers
            doc.fillColor('#ffffff')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('ITEM DESCRIPTION', 65, tableTop + 10)
                .text('PRICE', 330, tableTop + 10, { width: 60, align: 'right' })
                .text('QTY', 400, tableTop + 10, { width: 40, align: 'center' })
                .text('AMOUNT', 450, tableTop + 10, { width: 80, align: 'right' });

            // Table rows
            let yPosition = tableTop + 50;
            const rowHeight = 45;

            // Ensure we have items to display
            const items = order.items || [];

            console.log(`🔍 Processing ${items.length} items for PDF`);

            items.forEach((item, index) => {
                // Alternate row background
                if (index % 2 === 0) {
                    doc.rect(50, yPosition - 10, 500, rowHeight).fill('#fafafa');
                }

                // Extract product data - handle multiple possible structures
                let productName = 'Product';
                let productDesc = '';
                let itemPrice = 0;
                let itemQty = 1;

                // Try different ways to get product name
                if (item.product && item.product.name) {
                    productName = String(item.product.name);
                    productDesc = String(item.product.description || '');
                } else if (item.name) {
                    productName = String(item.name);
                    productDesc = String(item.description || '');
                }

                // Get price safely
                if (item.price !== null && item.price !== undefined) {
                    itemPrice = Number(item.price);
                }

                // Get quantity safely
                if (item.quantity !== null && item.quantity !== undefined) {
                    itemQty = Number(item.quantity);
                } else if (item.qty !== null && item.qty !== undefined) {
                    itemQty = Number(item.qty);
                }

                console.log(`🔍 Item ${index + 1}: ${productName} - Tk ${itemPrice} × ${itemQty}`);

                // Item name
                doc.fillColor(darkGray)
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .text(productName.slice(0, 40), 65, yPosition, { width: 250 });

                // Item description (if available)
                if (productDesc && productDesc.length > 0) {
                    doc.fillColor(mediumGray)
                        .fontSize(8)
                        .font('Helvetica')
                        .text(productDesc.slice(0, 60), 65, yPosition + 15, { width: 250 });
                }

                // Price
                doc.fillColor(darkGray)
                    .fontSize(10)
                    .font('Helvetica')
                    .text(`Tk ${itemPrice.toFixed(2)}`, 330, yPosition, { width: 60, align: 'right' });

                // Quantity
                doc.text(`×${itemQty}`, 400, yPosition, { width: 40, align: 'center' });

                // Line total
                const lineTotal = itemPrice * itemQty;
                doc.font('Helvetica-Bold')
                    .text(`Tk ${lineTotal.toFixed(2)}`, 450, yPosition, { width: 80, align: 'right' });

                yPosition += rowHeight;
            });

            // ========== TOTALS SECTION ==========
            const totalsY = yPosition + 20;

            // Totals box
            drawRoundedRect(350, totalsY, 200, 80, 8);
            doc.lineWidth(0.5).strokeColor(mediumGray).fillColor(lightGray).fillAndStroke();

            const orderTotal = Number(order.total) || 0;

            // Subtotal
            doc.fillColor(mediumGray)
                .fontSize(10)
                .font('Helvetica')
                .text('Subtotal:', 365, totalsY + 15, { width: 100 });

            doc.fillColor(darkGray)
                .text(`Tk ${orderTotal.toFixed(2)}`, 465, totalsY + 15, { width: 70, align: 'right' });

            // Tax (if applicable)
            doc.fillColor(mediumGray)
                .text('Tax (0%):', 365, totalsY + 35, { width: 100 });

            doc.fillColor(darkGray)
                .text('Tk 0.00', 465, totalsY + 35, { width: 70, align: 'right' });

            // Divider line
            doc.moveTo(360, totalsY + 55).lineTo(540, totalsY + 55).strokeColor(mediumGray).stroke();

            // Total
            drawRoundedRect(350, totalsY + 60, 200, 35, 5);
            doc.fill(primaryColor);

            doc.fillColor('#ffffff')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('TOTAL:', 365, totalsY + 70, { width: 100 });

            doc.fontSize(14)
                .text(`Tk ${orderTotal.toFixed(2)}`, 465, totalsY + 69, { width: 70, align: 'right' });

            // ========== FOOTER ==========
            const footerY = 720;

            // Divider line
            doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor(lightGray).stroke();

            // Footer text
            doc.fillColor(mediumGray)
                .fontSize(9)
                .font('Helvetica')
                .text('Thank you for your business!', 50, footerY + 15, { align: 'center', width: 500 });

            doc.fontSize(8)
                .text('For questions about this invoice, contact noor@gmail.com or call 01748269350', 50, footerY + 30, { align: 'center', width: 500 })
                .text('This is a computer-generated invoice. No signature required.', 50, footerY + 45, { align: 'center', width: 500 });

            doc.end();

            console.log('✅ PDF generation completed successfully');

        } catch (error) {
            console.error('❌ PDF generation error:', error);
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };