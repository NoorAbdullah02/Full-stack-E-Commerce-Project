const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { sendPasswordResetOTP } = require('../services/emailService');

const prisma = new PrismaClient();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Request password reset (send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing unused OTPs for this user
        await prisma.passwordReset.deleteMany({
            where: {
                userId: user.id,
                used: false
            }
        });

        // Create new password reset record
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                otp,
                expiresAt
            }
        });

        // Send OTP via email
        await sendPasswordResetOTP(user.email, user.name, otp);

        res.status(200).json({
            message: 'Password reset OTP sent to your email',
            email: user.email
        });

    } catch (error) {
        console.error('Request Password Reset Error:', error);
        res.status(500).json({ message: 'Failed to send password reset OTP' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find valid OTP
        const passwordReset = await prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                otp,
                used: false,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!passwordReset) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.status(200).json({
            message: 'OTP verified successfully',
            resetToken: passwordReset.id // Use this to reset password
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Find password reset record
        const passwordReset = await prisma.passwordReset.findUnique({
            where: { id: resetToken },
            include: { user: true }
        });

        if (!passwordReset || passwordReset.used || passwordReset.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and mark reset as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: passwordReset.userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordReset.update({
                where: { id: resetToken },
                data: { used: true }
            })
        ]);

        res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

module.exports = {
    requestPasswordReset,
    verifyOTP,
    resetPassword
};
