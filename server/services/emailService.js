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

const sendDay7PlantCareReminder = async (order, user) => {
    const customerEmail = user?.email || order?.shippingAddress?.email;
    const customerName = user?.name || 'Valued Customer';
    const ownerPhone = process.env.OWNER_PHONE || '01768686120';
    const plantsList = order.items?.map(i => i.product?.name || 'Live Botanical Plant').join(', ') || 'Your Botanical Plants';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f0fdf4; margin: 0; padding: 20px; line-height: 1.6; }
                .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 150, 105, 0.1); border: 1px solid #d1fae5; }
                .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; padding: 35px 25px; text-align: center; }
                .body { padding: 32px 28px; }
                .tip-card { background: #f8fafc; border-left: 4px solid #059669; padding: 14px 18px; border-radius: 8px; margin-bottom: 14px; }
                .tip-title { font-weight: 700; color: #065f46; font-size: 15px; margin-bottom: 4px; }
                .tip-text { font-size: 13px; color: #334155; margin: 0; }
                .plants-pill { display: inline-block; background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; margin: 12px 0; }
                .guarantee { background: #ecfdf5; border: 1.5px dashed #10b981; padding: 16px; border-radius: 12px; font-size: 13px; color: #065f46; margin-top: 24px; text-align: center; }
                .helpline { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">🌿 ৭ দিনের চারাগাছের বিশেষ যত্ন</h1>
                    <p style="margin: 8px 0 0; opacity: 0.95; font-size: 14px;">গ্রিন পেটালস গার্ডেন সেন্টার • শিকড় থিতু হওয়া ও হাইড্রেশন গাইড</p>
                </div>
                <div class="body">
                    <p>আসসালামু আলাইকুম <strong>${customerName}</strong>,</p>
                    <p>গ্রিন পেটালস থেকে আপনার পছন্দের চারাগাছটি হাতে পাওয়ার আজ <strong>৭ দিন</strong> হলো। আশা করি আপনার চারা নতুন পরিবেশে ধীরে ধীরে মানিয়ে নিচ্ছে।</p>
                    
                    <div class="plants-pill">
                        🌱 আপনার সংগ্রহ: ${plantsList}
                    </div>

                    <h3 style="color: #065f46; font-size: 16px; margin: 20px 0 12px;">🌿 প্রথম ৭-১০ দিনের গুরুত্বপূর্ণ পরিচর্যা টিপস:</h3>

                    <div class="tip-card">
                        <div class="tip-title">১. রোদ ও আলোর নিয়ন্ত্রণ (Bright Indirect Light)</div>
                        <p class="tip-text">চারাটি এখনও ভ্রমণজনিত ক্লান্তি (Transit shock) কাটাচ্ছে। তাই সরাসরি কড়া রোদে না রেখে জানালার পাশে বা বারান্দার এমন জায়গায় রাখুন যেখানে উজ্জ্বল কিন্তু পরোক্ষ আলো বাতাস পাওয়া যায়।</p>
                    </div>

                    <div class="tip-card">
                        <div class="tip-title">২. পানি দেওয়ার সঠিক রুটিন (Moisture Balance)</div>
                        <p class="tip-text">আঙ্গুল দিয়ে টবের ওপরের ১ ইঞ্চি মাটি পরীক্ষা করুন। শুকনা লাগলে পরিমিত পানি দিন। খেয়াল রাখবেন টবের ড্রেনেজ হোল দিয়ে অতিরিক্ত পানি যেন সহজে বের হয়ে যেতে পারে; গোড়ায় পানি জমে থাকলে শিকড় পচে যেতে পারে।</p>
                    </div>

                    <div class="tip-card">
                        <div class="tip-title">৩. স্প্রেয়ার দিয়ে পানির কুয়াশা (Gentle Misting)</div>
                        <p class="tip-text">সকালে বা বিকেলে একটি স্প্রেয়ার দিয়ে পাতার ওপর হালকা পানির কুয়াশা দিন। এতে চারার প্রাকৃতিক আর্দ্রতা বজায় থাকে এবং পাতা তরতাজা থাকে।</p>
                    </div>

                    <div class="tip-card">
                        <div class="tip-title">৪. স্বাভাবিক প্রাকৃতিক লক্ষণ (Natural Acclimatization)</div>
                        <p class="tip-text">নতুন জায়গায় মানিয়ে নেওয়ার সময় নিচের ১-২টি পাতা সামান্য হলুদ হয়ে ঝরে যেতে পারে, এতে ঘাবড়াবেন না। কাণ্ড ও ডাল সতেজ থাকলে খুব দ্রুতই নতুন কচি পাতার আগমন ঘটবে।</p>
                    </div>

                    <div class="guarantee">
                        💚 <strong>১০০% ভায়েবল রুট গ্যারান্টি:</strong> আপনার চারাটির সুস্থতা নিশ্চিত করা আমাদের দায়িত্ব।
                    </div>

                    <div class="helpline">
                        চারা নিয়ে যেকোনো প্রশ্ন বা ব্যক্তিগত পরামর্শের জন্য সরাসরি কথা বলুন:<br/>
                        <strong>মুন্নার খানম (প্রোপ্রাইটর ও প্ল্যান্ট কেয়ার কনসালট্যান্ট)</strong><br/>
                        📞 হটলাইন: <a href="tel:${ownerPhone}" style="color: #059669; font-weight: bold;">${ownerPhone}</a> • 
                        💬 হোয়াটসঅ্যাপ: <a href="https://wa.me/${ownerPhone}" style="color: #059669; font-weight: bold;">01768686120</a><br/>
                        🌐 ফেসবুক পেজ: <a href="https://www.facebook.com/share/1E2Y48eA5s/" style="color: #059669;">Green Petals Garden Centre</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        email: customerEmail,
        subject: `🌿 ৭ দিনের চারাগাছের বিশেষ যত্ন টিপস — Green Petals Garden Centre`,
        htmlContent
    });
};

const sendDay30PlantCareReminder = async (order, user) => {
    const customerEmail = user?.email || order?.shippingAddress?.email;
    const customerName = user?.name || 'Valued Customer';
    const ownerPhone = process.env.OWNER_PHONE || '01768686120';
    const plantsList = order.items?.map(i => i.product?.name || 'Live Botanical Plant').join(', ') || 'Your Botanical Plants';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f0fdf4; margin: 0; padding: 20px; line-height: 1.6; }
                .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 150, 105, 0.1); border: 1px solid #d1fae5; }
                .header { background: linear-gradient(135deg, #047857 0%, #059669 100%); color: #ffffff; padding: 35px 25px; text-align: center; }
                .body { padding: 32px 28px; }
                .tip-card { background: #f8fafc; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin-bottom: 14px; }
                .tip-title { font-weight: 700; color: #065f46; font-size: 15px; margin-bottom: 4px; }
                .tip-text { font-size: 13px; color: #334155; margin: 0; }
                .plants-pill { display: inline-block; background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; margin: 12px 0; }
                .coupon-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px dashed #059669; padding: 18px; border-radius: 14px; text-align: center; margin: 24px 0; }
                .helpline { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">🌱 ৩০ দিনের পুষ্টি ও নতুন বৃদ্ধি গাইড</h1>
                    <p style="margin: 8px 0 0; opacity: 0.95; font-size: 14px;">গ্রিন পেটালস গার্ডেন সেন্টার • জৈব সার ও দীর্ঘস্থায়ী পরিচর্যা</p>
                </div>
                <div class="body">
                    <p>আসসালামু আলাইকুম <strong>${customerName}</strong>,</p>
                    <p>গ্রিন পেটালস থেকে আপনার চারাগাছটি ঘরে আনার ১ মাস (৩০ দিন) পূর্ণ হলো! 🎉 এখন আপনার চারাটির শিকড় মাটির সাথে সুদৃঢ়ভাবে জুড়ে গেছে এবং নতুন পাতা ও কুঁড়ি ছড়ানোর উপযুক্ত সময় হয়েছে।</p>
                    
                    <div class="plants-pill">
                        🌿 আপনার চারা: ${plantsList}
                    </div>

                    <h3 style="color: #065f46; font-size: 16px; margin: 20px 0 12px;">🌱 ৩০ দিন বয়সে প্রয়োজনীয় পরিচর্যা:</h3>

                    <div class="tip-card">
                        <div class="tip-title">১. প্রথম জৈব সার প্রয়োগ (Organic Nourishment)</div>
                        <p class="tip-text">৩০ দিন পর চারার অতিরিক্ত পুষ্টি প্রয়োজন হয়। টবের কিনার ঘেঁষে ১-২ চা চামচ ভার্মিকম্পোস্ট বা পাতা পচা জৈব সার দিন এবং আলতো করে মাটির সাথে মিশিয়ে পরিমিত পানি দিন।</p>
                    </div>

                    <div class="tip-card">
                        <div class="tip-title">২. মাটি আলগা করা (Soil Aeration)</div>
                        <p class="tip-text">টবের উপরিভাগের মাটি কোনো ছোট নিড়ানি বা চামচ দিয়ে ১ ইঞ্চি গভীরতায় আলগা করে দিন। এতে মাটির ভেতর শিকড়ে প্রচুর অক্সিজেন চলাচল করতে পারে।</p>
                    </div>

                    <div class="tip-card">
                        <div class="tip-title">৩. শুষ্ক পাতা ছাঁটাই (Pruning & Shaping)</div>
                        <p class="tip-text">পুরোনো শুকনো পাতা বা হলুদ বোঁটা থাকলে পরিষ্কার কাঁচি দিয়ে কেটে ফেলুন। এতে গাছ অপ্রয়োজনীয় শক্তি অপচয় না করে দ্রুত নতুন কুঁড়ি ও ডালপালা বৃদ্ধি করবে।</p>
                    </div>

                    <div class="coupon-box">
                        <p style="margin: 0 0 6px; font-weight: 800; color: #065f46; font-size: 15px;">🌿 আপনার বারান্দা বা ঘরের বাগান আরও সাজাতে চান?</p>
                        <p style="margin: 0; font-size: 13px; color: #047857;">আমাদের নতুন সতেজ ইনডোর, সাকুলেন্ট ও সিজনাল ফুলের চারা দেখতে ভিজিট করুন:</p>
                        <a href="https://greenpetals.com/products" style="display: inline-block; margin-top: 10px; background: #059669; color: #ffffff; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">নতুন চারা কালেকশন দেখুন 🌿</a>
                    </div>

                    <div class="helpline">
                        যেকোনো সময় গাছ নিয়ে পরামর্শে আমরা পাশে আছি:<br/>
                        <strong>মুন্নার খানম (প্রোপ্রাইটর ও প্ল্যান্ট কেয়ার স্পেশালিস্ট)</strong><br/>
                        📞 হটলাইন: <a href="tel:${ownerPhone}" style="color: #059669; font-weight: bold;">${ownerPhone}</a> • 
                        💬 হোয়াটসঅ্যাপ: <a href="https://wa.me/${ownerPhone}" style="color: #059669; font-weight: bold;">01768686120</a><br/>
                        📍 Green Petals Garden Centre • Barishal, Bangladesh
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        email: customerEmail,
        subject: `🌱 ৩০ দিনের বৃদ্ধি ও পুষ্টি গাইড — আপনার চারাগাছের যত্ন (Green Petals)`,
        htmlContent
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetOTP,
    sendOwnerNewOrderAlert,
    sendDay7PlantCareReminder,
    sendDay30PlantCareReminder
};
