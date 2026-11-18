const axios = require('axios');
const path = require('path');
const fs = require('fs');

const sendEmail = async (options) => {
    const { email, subject, htmlContent, attachment } = options;

    if (!process.env.BREVO_API_KEY) {
        console.log(`ℹ️ [Email Simulation] Brevo API Key not provided. Email to "${email}" with subject "${subject}" was logged.`);
        return { message: 'Email logged (Brevo key not configured)' };
    }

    const data = {
        sender: {
            name: process.env.BREVO_SENDER_NAME || 'Green Petals',
            email: process.env.BREVO_SENDER_EMAIL || 'support@greenpetals.com',
        },
        to: [{ email }],
        subject: subject,
        htmlContent: htmlContent,
    };

    if (attachment) {
        data.attachment = [attachment];
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            data,
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout: 7000
            }
        );
        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Email API Error:', error.response ? error.response.data : error.message);
        // Do not crash the entire order transaction if email fails
        return null;
    }
};

const sendPasswordResetOTP = async (email, name, otp) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f0fdf4; margin: 0; padding: 20px; }
                .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.1); }
                .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 35px 25px; text-align: center; }
                .content { padding: 35px 30px; }
                .otp-box { background: #f0fdf4; border: 2px dashed #059669; padding: 20px; text-align: center; margin: 25px 0; border-radius: 12px; }
                .otp { font-size: 34px; font-weight: 800; color: #047857; letter-spacing: 6px; }
                .footer { text-align: center; padding: 20px; color: #64748b; font-size: 13px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 26px;">🌿 Green Petals</h1>
                    <p style="margin: 8px 0 0; opacity: 0.9; font-size: 15px;">Password Reset Verification Code</p>
                </div>
                <div class="content">
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>We received a request to reset your password for your Green Petals account. Enter the verification code below to continue:</p>
                    <div class="otp-box">
                        <p style="margin: 0 0 8px; color: #065f46; font-size: 13px; text-transform: uppercase; font-weight: 600;">Verification OTP</p>
                        <div class="otp">${otp}</div>
                        <p style="margin: 8px 0 0; color: #047857; font-size: 12px;">Valid for 10 minutes</p>
                    </div>
                    <ul style="color: #475569; font-size: 14px; padding-left: 20px;">
                        <li>This code will expire in <strong>10 minutes</strong>.</li>
                        <li>Never share your OTP code with anyone.</li>
                        <li>If you did not make this request, you can safely ignore this email.</li>
                    </ul>
                    <p style="margin-top: 25px;">Warm regards,<br><strong style="color: #047857;">Green Petals Team</strong><br><span style="font-size: 12px; color: #64748b;">Founder & Owner: Munnar Khanam (01768686120)</span></p>
                </div>
                <div class="footer">
                    <p style="margin: 0;">Green Petals — Bringing Nature To Your Doorstep 🌱</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        email,
        subject: '🔐 Password Reset OTP - Green Petals',
        htmlContent
    });
};

const sendOwnerNewOrderAlert = async (order, user) => {
    const ownerEmail = process.env.OWNER_EMAIL || 'munner.ent@gmail.com';
    const ownerName = process.env.OWNER_NAME || 'Munnar Khanam';

    const itemsRows = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.product?.name || 'Plant Product'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">৳${Number(item.price).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">৳${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: #f0fdf4; margin: 0; padding: 20px; }
                .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
                .top { background: linear-gradient(135deg, #047857 0%, #10b981 100%); color: #ffffff; padding: 30px 24px; text-align: center; }
                .body { padding: 30px 24px; }
                .alert-pill { display: inline-block; background: rgba(255,255,255,0.25); padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
                .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="top">
                    <div class="alert-pill">🌿 New Customer Order</div>
                    <h1 style="margin: 0; font-size: 24px;">Order #${order.id.slice(0, 8).toUpperCase()}</h1>
                    <p style="margin: 6px 0 0; opacity: 0.95;">Total Amount: ৳${Number(order.total).toFixed(2)}</p>
                </div>
                <div class="body">
                    <p>Hello <strong>${ownerName}</strong>,</p>
                    <p>A new order has just been placed on <strong>Green Petals</strong>! Here are the details:</p>

                    <div class="meta-box">
                        <h4 style="margin: 0 0 10px; color: #047857;">Customer & Shipping Details</h4>
                        <p style="margin: 4px 0;"><strong>Customer:</strong> ${user.name} (${user.email})</p>
                        <p style="margin: 4px 0;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
                        <p style="margin: 4px 0;"><strong>Address:</strong> ${order.shippingAddress?.address || 'N/A'}, ${order.shippingAddress?.city || ''}</p>
                        <p style="margin: 4px 0;"><strong>Payment Status:</strong> ${order.status}</p>
                        ${order.transactionId ? `<p style="margin: 4px 0;"><strong>Transaction ID:</strong> ${order.transactionId}</p>` : ''}
                    </div>

                    <h4 style="margin: 20px 0 10px; color: #047857;">Ordered Items:</h4>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left;">
                                <th style="padding: 10px;">Item</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                    </table>

                    <div style="margin-top: 25px; padding: 15px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px;">
                        <p style="margin: 0; color: #065f46; font-size: 14px;">
                            Please log in to your <strong>Admin Dashboard</strong> to process and ship this botanical order.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        email: ownerEmail,
        subject: `🌱 [New Order Alert] #${order.id.slice(0, 8).toUpperCase()} - ৳${Number(order.total).toFixed(2)} - Green Petals`,
        htmlContent
    });
};

module.exports = { sendEmail, sendPasswordResetOTP, sendOwnerNewOrderAlert };
