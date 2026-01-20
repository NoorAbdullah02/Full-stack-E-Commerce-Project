const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getChatResponse = async (history, message) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    try {
        const model = genAI.getGenerativeModel({
            // model: 'gemini-2.0-flash'
            model: "google/gemini-2.5-flash-lite",
        });


        // Construct chat history in Gemini format if needed, or just use single prompt context
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role, // 'user' or 'model'
                parts: [{ text: h.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('AI Service Failed');
    }
};

const generateProductDescription = async (productName, category) => {
    try {
        const model = genAI.getGenerativeModel({
            // model: 'gemini-2.0-flash'
            model: "google/gemini-2.5-flash-lite",
        }); const prompt = `Write a compelling and SEO-friendly product description for a ${category} product named "${productName}". Highlight its key features and benefits in a professional tone.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('AI Service Failed');
    }
};

module.exports = { getChatResponse, generateProductDescription };
