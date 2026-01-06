const { getChatResponse, generateProductDescription } = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Chat with AI Bot
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        // Normalize history for Gemini
        const formattedHistory = history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        }));

        // Optional logging
        if (req.user) {
            await prisma.aILog.create({
                data: {
                    query: message,
                    response: 'Pending...',
                    type: 'CHATBOT'
                }
            });
        }

        const responseText = await getChatResponse(formattedHistory, message);

        res.json({ response: responseText });

    } catch (error) {
        console.error("AI Controller Error:", error.message);

        if (error.message.includes("quota")) {
            return res.status(429).json({
                success: false,
                message: "AI quota exceeded. Please try again later."
            });
        }

        res.status(500).json({ message: "AI Chat failed" });
    }
};

// @desc    Generate Product Description
// @route   POST /api/ai/generate-description
const generateDescription = async (req, res) => {
    try {
        const { name, category } = req.body;

        const description = await generateProductDescription(name, category);

        res.json({ description });
    } catch (error) {
        console.error("Generate Description Error:", error.message);

        res.status(500).json({ message: "Generation failed" });
    }
};

module.exports = { chatWithAI, generateDescription };
