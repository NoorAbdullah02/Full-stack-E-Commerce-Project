const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// Cache catalog for 5 minutes so DB isn't hit on every single message
let cachedCatalogText = '';
let lastCatalogFetch = 0;

const getLiveCatalogContext = async () => {
    const now = Date.now();
    if (cachedCatalogText && (now - lastCatalogFetch < 5 * 60 * 1000)) {
        return cachedCatalogText;
    }

    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                description: true,
                category: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });

        const catalogLines = products.map((p, idx) => {
            const cat = p.category ? p.category.name : 'General';
            return `${idx + 1}. ${p.name} | Category: ${cat} | Price: Tk. ${p.price} | Stock: ${p.stock > 0 ? `${p.stock} available` : 'Out of stock'} | Details: ${p.description || 'Botanical plant'}`;
        });

        cachedCatalogText = catalogLines.join('\n');
        lastCatalogFetch = now;
        return cachedCatalogText;
    } catch (err) {
        console.error('Failed to fetch live catalog for AI:', err.message);
        return cachedCatalogText || 'Catalog items available: Monstera, Snake Plant, Peace Lily, Areca Palm, Succulents, Jasmine (Beli), Adenium, Vermicompost, Terracotta Pots.';
    }
};

const getChatResponse = async (history = [], message) => {
    const apiKey = process.env.GROQ_API_KEY;

    // Fetch live inventory catalog from Neon DB
    const catalogContext = await getLiveCatalogContext();

    const systemPrompt = `You are the intelligent, warm, and expert Botanical & Store Assistant for "Green Petals" (গ্রিন পেটালস) — Bangladesh's premier online live plant nursery & boutique.

ABOUT GREEN PETALS:
- Founder & Proprietor: Munnar Khanam (মুন্নার খানম)
- Phone / Hotline / WhatsApp: 01768686120
- Email: munner.ent@gmail.com
- Facebook Official Page: https://www.facebook.com/share/1E2Y48eA5s/
- Location & Nursery: Barishal, Bangladesh. We deliver healthy live plants nationwide across all 64 districts!
- Delivery Rates: Inside Barishal Metro = Tk. 100 (24-48 hours express), Outside Barishal (All 64 Districts) = Tk. 180 (2-4 days with moisture-lock root protection packaging). Weight tiered: +Tk. 20 per extra kg above 1kg.
- Payment Option: Exclusive Prepaid bKash Send Money to 01715020391 (Proprietor: Munnar Khanam). Cash on Delivery is disabled so our botanical team can immediately prepare, moisture-pack, and express-dispatch living plants.
- Official bKash Number: 01715020391 (Personal / Send Money to Munnar Khanam). Customers send money, copy the Transaction ID (TrxID), and confirm their order on the website.
- Tax / VAT: 0% Tax (No tax or hidden charges).

LIVE PRODUCT CATALOG & INVENTORY (DIRECT FROM STORE DATABASE):
${catalogContext}

YOUR INSTRUCTIONS:
1. Language: Answer naturally in English, Bengali (বাংলা), or Banglish according to whatever the user uses.
2. Store Awareness: Always use the exact prices, product names, categories, and stock from the live catalog above. If a customer asks about a plant, give its price in Tk. / ৳, mention its benefits (e.g. air purifying, low-light, pet safety), and basic care tips (watering, sunlight).
3. Contact & Orders: If customers ask how to buy, guide them to add the plant to cart, proceed to checkout, enter their delivery address, and pay via bKash Send Money (01715020391). Provide Munnar Khanam's phone (01768686120) or Facebook link (https://www.facebook.com/share/1E2Y48eA5s/) if they ask for personal consultation.
4. Tone: Warm, respectful, botanical, helpful, and concise. Use plant emojis (🌿, 🌱, 🌸, 🪴) where appropriate.`;

    if (!apiKey) {
        const lower = (message || '').toLowerCase();
        if (lower.includes('bkash') || lower.includes('payment') || lower.includes('cod') || lower.includes('cash')) {
            return "Our official bKash Send Money number is 01715020391 (Proprietor: Munnar Khanam). Cash on Delivery is unavailable to ensure immediate plant packing & expedited delivery! 🌿";
        }
        if (lower.includes('contact') || lower.includes('phone') || lower.includes('munnar') || lower.includes('fb') || lower.includes('facebook')) {
            return "You can reach Green Petals proprietor Munnar Khanam at 01768686120 or visit our official Facebook page: https://www.facebook.com/share/1E2Y48eA5s/ 🌸";
        }
        return "Welcome to Green Petals! 🌿 We have 22+ healthy botanical plant varieties. How can I help you pick the perfect plant today?";
    }

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({
                role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content || ''
            })),
            { role: 'user', content: message }
        ];

        const response = await axios.post(
            GROQ_API_URL,
            {
                model: GROQ_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 800
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 12000
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        }

        return "I am glad to assist you with any plant care, prices, or orders on Green Petals! 🌱";
    } catch (error) {
        console.error('Groq AI API Error:', error.response ? error.response.data : error.message);
        return "Welcome to Green Petals! 🌿 For any order or plant advice, feel free to call proprietor Munnar Khanam at 01768686120.";
    }
};

const generateProductDescription = async (productName, category) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return `A healthy, premium botanical plant: ${productName} (${category}). Carefully potted in nutrient-rich organic soil to ensure thriving growth and vibrant foliage.`;
    }

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert botanical copywriter for Green Petals plant boutique. Write poetic, engaging, informative, and SEO-friendly plant descriptions.'
                    },
                    {
                        role: 'user',
                        content: `Write an engaging product description for a plant or gardening item named "${productName}" in category "${category}". Highlight light, watering, aesthetic appeal, and benefits.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 400
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        }

        return `A healthy, premium botanical plant: ${productName} (${category}). Carefully potted in nutrient-rich organic soil.`;
    } catch (error) {
        console.error('Groq Description Generation Error:', error.response ? error.response.data : error.message);
        return `A healthy, premium botanical plant: ${productName} (${category}). Carefully potted in nutrient-rich organic soil to ensure thriving growth.`;
    }
};

module.exports = { getChatResponse, generateProductDescription };
