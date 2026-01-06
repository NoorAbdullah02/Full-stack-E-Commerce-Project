const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting product seeding...');

    // Create Categories
    const categories = [
        { name: 'Electronics' },
        { name: 'Fashion' },
        { name: 'Home & Garden' },
        { name: 'Sports & Outdoors' },
        { name: 'Books' },
        { name: 'Beauty & Health' }
    ];

    const createdCategories = {};
    for (const category of categories) {
        const cat = await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category
        });
        createdCategories[category.name] = cat;
        console.log(`✓ Category created: ${cat.name}`);
    }

    // Create Products
    const products = [
        // Electronics
        {
            name: 'Wireless Bluetooth Headphones',
            description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Features advanced Bluetooth 5.0 technology, comfortable over-ear design, and crystal-clear sound quality. Perfect for music lovers and professionals.',
            price: 3500,
            originalPrice: 4500,
            discount: 22,
            stock: 45,
            categoryName: 'Electronics',
            images: [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
            ]
        },
        {
            name: 'Smart Watch Pro',
            description: 'Advanced fitness tracker with heart rate monitor, GPS, and 7-day battery life. Track your workouts, monitor your health, and stay connected with smart notifications. Water-resistant up to 50 meters.',
            price: 5200,
            originalPrice: 6500,
            discount: 20,
            stock: 30,
            categoryName: 'Electronics',
            images: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'
            ]
        },
        {
            name: 'USB-C Fast Charger 65W',
            description: 'Universal fast charging adapter compatible with laptops, tablets, and smartphones. Compact design with multiple safety protections. Includes USB-C to USB-C cable.',
            price: 1200,
            originalPrice: 1500,
            discount: 20,
            stock: 100,
            categoryName: 'Electronics',
            images: [
                'https://images.unsplash.com/photo-1591290619762-c588f7e8e8e0?w=500'
            ]
        },
        {
            name: 'Wireless Mouse RGB',
            description: 'Ergonomic wireless mouse with customizable RGB lighting and 6 programmable buttons. 2400 DPI precision sensor for gaming and productivity. Long-lasting rechargeable battery.',
            price: 850,
            originalPrice: null,
            discount: null,
            stock: 75,
            categoryName: 'Electronics',
            images: [
                'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
            ]
        },

        // Fashion
        {
            name: 'Classic Denim Jacket',
            description: 'Timeless denim jacket made from premium cotton. Features button closure, chest pockets, and a comfortable regular fit. Perfect for casual everyday wear.',
            price: 2800,
            originalPrice: 3500,
            discount: 20,
            stock: 25,
            categoryName: 'Fashion',
            images: [
                'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
                'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'
            ]
        },
        {
            name: 'Premium Cotton T-Shirt Pack (3 pcs)',
            description: 'Set of 3 high-quality cotton t-shirts in classic colors: black, white, and navy. Soft, breathable fabric with reinforced stitching. Available in all sizes.',
            price: 1500,
            originalPrice: 2100,
            discount: 29,
            stock: 60,
            categoryName: 'Fashion',
            images: [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
            ]
        },
        {
            name: 'Leather Crossbody Bag',
            description: 'Elegant genuine leather crossbody bag with adjustable strap. Multiple compartments for organization. Perfect for daily use or special occasions.',
            price: 3200,
            originalPrice: null,
            discount: null,
            stock: 18,
            categoryName: 'Fashion',
            images: [
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'
            ]
        },

        // Home & Garden
        {
            name: 'Ceramic Plant Pot Set (3 pcs)',
            description: 'Beautiful set of 3 ceramic plant pots with drainage holes and saucers. Modern minimalist design in white with geometric patterns. Perfect for succulents and small plants.',
            price: 950,
            originalPrice: 1200,
            discount: 21,
            stock: 40,
            categoryName: 'Home & Garden',
            images: [
                'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'
            ]
        },
        {
            name: 'Aromatherapy Diffuser',
            description: 'Ultrasonic essential oil diffuser with LED color-changing lights. Creates a relaxing atmosphere while humidifying the air. Automatic shut-off feature for safety.',
            price: 1800,
            originalPrice: 2400,
            discount: 25,
            stock: 35,
            categoryName: 'Home & Garden',
            images: [
                'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500'
            ]
        },
        {
            name: 'Bamboo Kitchen Utensil Set',
            description: 'Eco-friendly 6-piece bamboo cooking utensil set including spatula, spoon, fork, and more. Durable, heat-resistant, and gentle on cookware.',
            price: 650,
            originalPrice: null,
            discount: null,
            stock: 55,
            categoryName: 'Home & Garden',
            images: [
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'
            ]
        },

        // Sports & Outdoors
        {
            name: 'Yoga Mat Premium',
            description: 'Extra thick 6mm yoga mat with non-slip surface and carrying strap. Made from eco-friendly TPE material. Perfect for yoga, pilates, and floor exercises.',
            price: 1400,
            originalPrice: 1800,
            discount: 22,
            stock: 50,
            categoryName: 'Sports & Outdoors',
            images: [
                'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'
            ]
        },
        {
            name: 'Resistance Bands Set (5 pcs)',
            description: 'Complete set of 5 resistance bands with different strength levels. Includes door anchor, handles, and ankle straps. Perfect for home workouts and physical therapy.',
            price: 1100,
            originalPrice: 1500,
            discount: 27,
            stock: 45,
            categoryName: 'Sports & Outdoors',
            images: [
                'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'
            ]
        },
        {
            name: 'Stainless Steel Water Bottle 1L',
            description: 'Double-wall insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof lid and wide mouth for easy cleaning.',
            price: 850,
            originalPrice: null,
            discount: null,
            stock: 70,
            categoryName: 'Sports & Outdoors',
            images: [
                'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'
            ]
        },

        // Books
        {
            name: 'The Art of Programming - Complete Guide',
            description: 'Comprehensive guide to modern programming practices. Covers algorithms, data structures, design patterns, and best practices. Perfect for beginners and intermediate developers.',
            price: 1200,
            originalPrice: 1500,
            discount: 20,
            stock: 30,
            categoryName: 'Books',
            images: [
                'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'
            ]
        },
        {
            name: 'Mindfulness & Meditation Handbook',
            description: 'Practical guide to mindfulness and meditation techniques. Includes daily exercises, breathing techniques, and stress management strategies.',
            price: 650,
            originalPrice: 850,
            discount: 24,
            stock: 40,
            categoryName: 'Books',
            images: [
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'
            ]
        },

        // Beauty & Health
        {
            name: 'Organic Face Serum Set',
            description: 'Premium organic face serum with vitamin C and hyaluronic acid. Reduces fine lines, brightens skin, and provides deep hydration. Suitable for all skin types.',
            price: 2200,
            originalPrice: 2800,
            discount: 21,
            stock: 25,
            categoryName: 'Beauty & Health',
            images: [
                'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500'
            ]
        },
        {
            name: 'Natural Skincare Gift Set',
            description: 'Luxurious 5-piece skincare set including cleanser, toner, serum, moisturizer, and face mask. Made with natural ingredients. Perfect gift for loved ones.',
            price: 3500,
            originalPrice: 4500,
            discount: 22,
            stock: 20,
            categoryName: 'Beauty & Health',
            images: [
                'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
                'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500'
            ]
        },
        {
            name: 'Electric Facial Cleansing Brush',
            description: 'Waterproof sonic facial cleansing brush with 3 speed settings. Removes makeup and deep cleans pores. USB rechargeable with long battery life.',
            price: 1600,
            originalPrice: 2000,
            discount: 20,
            stock: 35,
            categoryName: 'Beauty & Health',
            images: [
                'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500'
            ]
        },
        {
            name: 'Vitamin C Supplement (60 capsules)',
            description: 'High-potency vitamin C supplement for immune support. 1000mg per capsule. Non-GMO and gluten-free. 2-month supply.',
            price: 750,
            originalPrice: null,
            discount: null,
            stock: 80,
            categoryName: 'Beauty & Health',
            images: [
                'https://images.unsplash.com/photo-1550572017-4d93e4e3a96f?w=500'
            ]
        },
        {
            name: 'Bamboo Toothbrush Set (4 pcs)',
            description: 'Eco-friendly bamboo toothbrush set with soft bristles. Biodegradable and sustainable alternative to plastic toothbrushes. Comes in 4 different colors.',
            price: 450,
            originalPrice: 600,
            discount: 25,
            stock: 90,
            categoryName: 'Beauty & Health',
            images: [
                'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500'
            ]
        }
    ];

    let createdCount = 0;
    for (const product of products) {
        const { categoryName, ...productData } = product;

        await prisma.product.create({
            data: {
                ...productData,
                categoryId: createdCategories[categoryName].id
            }
        });
        createdCount++;
        console.log(`✓ Product created: ${product.name}`);
    }

    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`📦 Created ${Object.keys(createdCategories).length} categories`);
    console.log(`🛍️  Created ${createdCount} products`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
