const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateInvoicePDF = (order, user) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('🔍 PDF Generation - Order ID:', order.id);

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

            // Botanical Color Palette
            const primaryColor = '#059669'; // Emerald 600
            const accentColor = '#10b981';  // Emerald 500
            const darkGray = '#0f172a';
            const mediumGray = '#64748b';
            const lightGray = '#f0fdf4';
            const successGreen = '#16a34a';

            const drawRoundedRect = (x, y, width, height, radius) => {
                doc.roundedRect(x, y, width, height, radius);
            };

            // ========== HEADER SECTION ==========
            doc.rect(0, 0, 612, 120).fill(primaryColor);
            doc.rect(0, 100, 612, 20).fillOpacity(0.3).fill(accentColor).fillOpacity(1);

            // Green Petals Botanical Logo
            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 35, { width: 50, height: 50 });
                } catch (e) {
                    doc.circle(75, 60, 25).fill('#ffffff');
                    doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold')
                        .text('GP', 63, 52);
                }
            } else {
                doc.circle(75, 60, 25).fill('#ffffff');
                doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold')
                    .text('GP', 63, 52);
            }

            // Brand name and tagline
            doc.fillColor('#ffffff')
                .fontSize(23)
                .font('Helvetica-Bold')
                .text('Green Petals', 112, 42);

            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#dcfce7')
                .text('Garden Centre • Living Plants & Botanical Boutique', 112, 68);

            // Owner & Contact Info (right aligned)
            const ownerPhone = process.env.OWNER_PHONE || '01768686120';
            const ownerEmail = process.env.OWNER_EMAIL || 'munner.ent@gmail.com';

            doc.fontSize(9)
                .font('Helvetica')
                .fillColor('#ffffff')
                .text('Barishal Metro, Bangladesh', 380, 40, { align: 'right', width: 170 })
                .text(`Proprietor: Munnar Khanam`, 380, 53, { align: 'right', width: 170 })
                .text(ownerEmail, 380, 66, { align: 'right', width: 170 })
                .text(`Hotline: ${ownerPhone}`, 380, 79, { align: 'right', width: 170 });

            // ========== INVOICE TITLE ==========
            doc.fillColor(darkGray)
                .fontSize(26)
                .font('Helvetica-Bold')
                .text('OFFICIAL INVOICE', 50, 150);

            // Status badge
            const statusColors = {
                PAID: successGreen,
                PENDING: '#f59e0b',
                PROCESSING: '#0284c7',
                SHIPPED: '#7c3aed',
                ON_THE_WAY: '#0d9488',
                DELIVERED: successGreen,
                CANCELLED: '#dc2626'
            };

            const statusColor = statusColors[order.status] || mediumGray;
            const statusX = 450;
            const statusY = 153;

            drawRoundedRect(statusX, statusY, 100, 25, 5);
            doc.fillOpacity(0.15).fill(statusColor).fillOpacity(1);

            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor(statusColor)
                .text(order.status, statusX, statusY + 8, { width: 100, align: 'center' });

            // ========== INVOICE INFO BOXES ==========
            const boxY = 195;

            // Invoice details box
            drawRoundedRect(50, boxY, 240, 105, 8);
            doc.lineWidth(0.5).strokeColor('#86efac').fillColor(lightGray).fillAndStroke();

            doc.fillColor(darkGray).fontSize(11).font('Helvetica-Bold')
                .text('Invoice Details', 65, boxY + 12);

            doc.fontSize(9).font('Helvetica').fillColor(mediumGray)
                .text('Invoice #:', 65, boxY + 32)
                .text('Order ID:', 65, boxY + 47)
                .text('Date:', 65, boxY + 62)
                .text('Payment Method:', 65, boxY + 77)
                .text('Transaction ID:', 65, boxY + 92);

            const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const paymentDisplay = 'bKash Send Money';
            const trxDisplay = order.transactionId ? `TrxID: ${order.transactionId}` : 'Prepaid (Verified)';

            doc.font('Helvetica-Bold').fillColor(darkGray)
                .text(`INV-${order.id.slice(0, 8).toUpperCase()}`, 160, boxY + 32)
                .text(`#${order.id.slice(0, 8).toUpperCase()}`, 160, boxY + 47)
                .text(invoiceDate, 160, boxY + 62)
                .text(paymentDisplay, 160, boxY + 77)
                .text(trxDisplay, 160, boxY + 92, { width: 120, ellipsis: true });

            // Customer details box
            drawRoundedRect(310, boxY, 240, 105, 8);
            doc.lineWidth(0.5).strokeColor('#86efac').fillColor(lightGray).fillAndStroke();

            doc.fillColor(darkGray).fontSize(11).font('Helvetica-Bold')
                .text('Billed & Shipped To', 325, boxY + 12);

            const customerDisplayName = (user?.name || 'Valued Customer')
                .replace(/\(Super Admin\)/gi, '(Owner)')
                .replace(/\(Owner & Super Admin\)/gi, '(Owner)');

            doc.fontSize(9).font('Helvetica-Bold').fillColor(darkGray)
                .text(customerDisplayName, 325, boxY + 32);

            doc.font('Helvetica').fillColor(mediumGray)
                .text(user?.email || '', 325, boxY + 47)
                .text(order.shippingAddress?.phone || user?.phone || 'Customer Phone: N/A', 325, boxY + 62)
                .text(`${order.shippingAddress?.address || ''}`, 325, boxY + 77, { width: 215, ellipsis: true })
                .text(`${order.shippingAddress?.city || 'Barishal'}, Bangladesh`, 325, boxY + 92, { width: 215, ellipsis: true });

            // ========== TABLE OF ITEMS ==========
            const tableTop = 325;

            // Table Header
            doc.rect(50, tableTop, 500, 25).fill(primaryColor);
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
                .text('Item Description', 65, tableTop + 8, { width: 230 })
                .text('Qty', 300, tableTop + 8, { width: 50, align: 'center' })
                .text('Unit Price (BDT)', 350, tableTop + 8, { width: 100, align: 'right' })
                .text('Total (BDT)', 450, tableTop + 8, { width: 90, align: 'right' });

            let y = tableTop + 30;
            let subtotal = 0;

            order.items.forEach((item, index) => {
                const itemTotal = Number(item.price) * item.quantity;
                subtotal += itemTotal;

                if (index % 2 === 0) {
                    doc.rect(50, y - 5, 500, 24).fill('#f8fafc');
                }

                doc.fillColor(darkGray).fontSize(9).font('Helvetica')
                    .text(item.product?.name || 'Botanical Plant Item', 65, y, { width: 230, ellipsis: true })
                    .text(item.quantity.toString(), 300, y, { width: 50, align: 'center' })
                    .text(`Tk. ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 350, y, { width: 100, align: 'right' })
                    .text(`Tk. ${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 450, y, { width: 90, align: 'right' });

                y += 24;
            });

            // ========== SUMMARY / TOTAL SECTION ==========
            y += 15;
            const summaryX = 310;

            doc.rect(summaryX, y, 240, 95).fill('#f0fdf4');
            doc.rect(summaryX, y, 240, 95).strokeColor('#86efac').stroke();

            const total = Number(order.total);
            const deliveryFee = total > subtotal ? total - subtotal : 0;

            doc.fontSize(9).font('Helvetica').fillColor(mediumGray)
                .text('Subtotal:', summaryX + 15, y + 15)
                .text('Delivery & Protective Packaging:', summaryX + 15, y + 35);

            doc.font('Helvetica-Bold').fillColor(darkGray)
                .text(`Tk. ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryX + 130, y + 15, { width: 95, align: 'right' })
                .text(`Tk. ${deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryX + 130, y + 35, { width: 95, align: 'right' });

            doc.moveTo(summaryX + 15, y + 55).lineTo(summaryX + 225, y + 55).strokeColor('#86efac').stroke();

            doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor)
                .text('Total Amount Payable:', summaryX + 15, y + 68)
                .text(`Tk. ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryX + 120, y + 68, { width: 105, align: 'right' });

            // ========== FOOTER SECTION ==========
            const footerY = 715;
            doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor('#86efac').stroke();

            doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor)
                .text('Thank you for choosing Green Petals Garden Centre!', 50, footerY + 15, { align: 'center', width: 500 });

            doc.fontSize(8).font('Helvetica').fillColor(mediumGray)
                .text(`Proprietor: Munnar Khanam | Helpline: ${ownerPhone} | Email: ${ownerEmail}`, 50, footerY + 30, { align: 'center', width: 500 })
                .text(`Facebook: https://www.facebook.com/share/1E2Y48eA5s/ | 100% Viable Root Botanical Guarantee`, 50, footerY + 44, { align: 'center', width: 500 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateInvoicePDF };
