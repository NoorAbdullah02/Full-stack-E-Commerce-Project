const axios = require('axios');
const path = require('path');
const fs = require('fs');

const sendEmail = async (options) => {
    const { email, subject, htmlContent, attachment } = options;

    const data = {
        sender: {
            name: process.env.BREVO_SENDER_NAME || 'AI Ecommerce',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@example.com',
        },
        to: [{ email }],
        subject: subject,
        htmlContent: htmlContent,
    };

    if (attachment) {
        // attachment should be { name: 'invoice.pdf', content: 'base64string' }
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
                timeout: 5000 // 5 seconds timeout
            }
        );
        // Log success
        console.log('Email sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Email API Error:', error.response ? error.response.data : error.message);
        throw new Error('Email could not be sent');
    }
};

const sendPasswordResetOTP = async (email, name, otp) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                .otp { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                    <div class="otp-box">
                        <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                        <div class="otp">${otp}</div>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
                    </div>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This OTP will expire in <strong>10 minutes</strong></li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                    <p>Thank you,<br><strong>AI Ecommerce Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        email,
        subject: 'Password Reset OTP - AI Ecommerce',
        htmlContent
    });
};

module.exports = { sendEmail, sendPasswordResetOTP };
