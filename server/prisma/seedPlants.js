const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌿 Starting Green Petals Botanical Seeding...');

    // Clean existing products and categories to ensure pure plant store
    // Delete in order to satisfy foreign keys
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('🧹 Cleaned existing non-plant data.');

    // 1. Categories
    const categories = [
        { name: 'Indoor Plants' },
        { name: 'Flowering Plants' },
        { name: 'Succulents & Cacti' },
        { name: 'Air Purifying Plants' },
        { name: 'Pots & Planters' },
        { name: 'Plant Care & Organic Soil' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
        const created = await prisma.category.create({
            data: cat
        });
        categoryMap[cat.name] = created.id;
        console.log(`✅ Category: ${cat.name}`);
    }

    // 2. Botanical Plant Products
    const plantProducts = [
        // Indoor Plants
        {
            name: 'Monstera Deliciosa (Swiss Cheese Plant)',
            description: 'The iconic Swiss Cheese plant is a stunning tropical centerpiece for any living room or workspace. Known for its dramatic perforated split leaves that purify air and bring tropical luxury. Thrives in bright indirect sunlight with moderate watering once every 7-10 days.',
            price: 1450,
            originalPrice: 1800,
            discount: 19,
            stock: 25,
            categoryId: categoryMap['Indoor Plants'],
            images: [
                'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1598880940371-c756e015faf5?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Fiddle Leaf Fig (Ficus Lyrata)',
            description: 'A designer favorite! The Fiddle Leaf Fig features large, heavily veined violin-shaped leaves that grow upright. Adds an architectural silhouette to modern interiors. Prefers stable, bright indirect light and watering when the top 2 inches of soil feel dry.',
            price: 2400,
            originalPrice: 2950,
            discount: 18,
            stock: 18,
            categoryId: categoryMap['Indoor Plants'],
            images: [
                'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Golden Pothos (Devil\'s Ivy)',
            description: 'Extremely forgiving and fast-growing cascading vine. Characterized by heart-shaped green leaves marbled with creamy golden variegation. Outstanding natural air cleaner that tolerates low light conditions and sporadic watering.',
            price: 450,
            originalPrice: 550,
            discount: 18,
            stock: 50,
            categoryId: categoryMap['Indoor Plants'],
            images: [
                'https://images.unsplash.com/photo-1620127814166-5298c29b1aa0?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1596724803697-3f9b7c8df2ec?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Calathea Orbifolia (Prayer Plant)',
            description: 'Renowned for its broad silver-striped emerald foliage, the Calathea gently folds its leaves upwards at night like hands in prayer. Ideal for humid spots, bathrooms, or bedrooms seeking serene botanical beauty.',
            price: 1200,
            originalPrice: 1500,
            discount: 20,
            stock: 20,
            categoryId: categoryMap['Indoor Plants'],
            images: [
                'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&auto=format&fit=crop&q=80'
            ]
        },

        // Flowering Plants
        {
            name: 'Arabian Jasmine (Beli Ful)',
            description: 'Beloved traditional fragrant flower with pure white starry blooms that emanate an intoxicating sweet scent. Perfect for balconies, verandas, or sunny windowsills. Symbols of purity, peace, and timeless elegance.',
            price: 350,
            originalPrice: 450,
            discount: 22,
            stock: 40,
            categoryId: categoryMap['Flowering Plants'],
            images: [
                'https://images.unsplash.com/photo-1599818816843-c28b6d210515?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Red Desert Rose (Adenium Obesum)',
            description: 'Exotic succulent bonsai with a thick, sculptural caudex and profuse trumpet-shaped fiery scarlet blossoms. Extremely drought-tolerant and adores direct sunlight. A true living sculpture for plant collectors.',
            price: 1350,
            originalPrice: 1700,
            discount: 20,
            stock: 15,
            categoryId: categoryMap['Flowering Plants'],
            images: [
                'https://images.unsplash.com/photo-1616857532247-49f3900f8623?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Phalaenopsis Orchid (Moth Orchid)',
            description: 'Refined royal orchid with cascading pink and white butterfly blooms that remain vibrant for 2 to 3 months. Comes established in premium sphagnum moss and breathable orchid bark pot.',
            price: 2100,
            originalPrice: 2600,
            discount: 19,
            stock: 12,
            categoryId: categoryMap['Flowering Plants'],
            images: [
                'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Hibiscus Rosa-sinensis (Joba)',
            description: 'Show-stopping tropical perennial with brilliant crimson petals and golden pollen stamens. Attracts butterflies and blooms continuously throughout warmer seasons with modest watering and sunshine.',
            price: 480,
            originalPrice: 600,
            discount: 20,
            stock: 35,
            categoryId: categoryMap['Flowering Plants'],
            images: [
                'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
            ]
        },

        // Succulents & Cacti
        {
            name: 'Echeveria Elegans (Mexican Snowball)',
            description: 'A symmetrical rosette succulent with silvery-blue, fleshy leaves resembling a carved rose flower. Compact, ultra-low maintenance, and resilient. Requires minimal watering once every 2 weeks.',
            price: 320,
            originalPrice: 400,
            discount: 20,
            stock: 45,
            categoryId: categoryMap['Succulents & Cacti'],
            images: [
                'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Haworthia Fasciata (Zebra Succulent)',
            description: 'Distinctive dark green pointy leaves accented by white horizontal raised zebra stripes. Perfectly sized for study desks, bedside tables, or computer setups. Does not require harsh sun.',
            price: 380,
            originalPrice: 480,
            discount: 20,
            stock: 30,
            categoryId: categoryMap['Succulents & Cacti'],
            images: [
                'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Golden Barrel Cactus (Echinocactus)',
            description: 'Globular spherical desert cactus armed with luminous golden spines. A dramatic statement piece that can live for decades with virtually zero maintenance and maximum sunlight.',
            price: 750,
            originalPrice: 950,
            discount: 21,
            stock: 18,
            categoryId: categoryMap['Succulents & Cacti'],
            images: [
                'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Aloe Vera Barbadensis Miller',
            description: 'The miracle healing plant! Plump fleshy spear leaves packed with soothing, nutrient-rich medicinal gel for skincare, minor burns, and haircare. Extremely hardy and easy to propagate.',
            price: 290,
            originalPrice: 380,
            discount: 23,
            stock: 60,
            categoryId: categoryMap['Succulents & Cacti'],
            images: [
                'https://images.unsplash.com/photo-1567689594406-3d7c95e1e075?w=800&auto=format&fit=crop&q=80'
            ]
        },

        // Air Purifying Plants
        {
            name: 'Sansevieria Trifasciata (Snake Plant)',
            description: 'NASA-certified top air purifying plant. Converts CO2 into oxygen during nighttime, making it the ideal bedroom companion. Sword-like mottled leaves with golden margins survive neglect, low light, and drought.',
            price: 650,
            originalPrice: 850,
            discount: 23,
            stock: 40,
            categoryId: categoryMap['Air Purifying Plants'],
            images: [
                'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1572688484437-33b66479e0f0?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Spathiphyllum (Peace Lily)',
            description: 'Graceful glossy deep-green leaves crowned with pure white serenity spathes. Excellent at filtering toxins such as benzene and formaldehyde. Droops slightly when thirsty, telling you exactly when to water.',
            price: 850,
            originalPrice: 1100,
            discount: 22,
            stock: 25,
            categoryId: categoryMap['Air Purifying Plants'],
            images: [
                'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Areca Palm (Chrysalidocarpus Lutescens)',
            description: 'Feathery, arching golden-green fronds that bring a lush tropical breeze to indoor spaces. Functions as a natural humidifier and absorbs household pollutants effectively.',
            price: 1650,
            originalPrice: 2100,
            discount: 21,
            stock: 14,
            categoryId: categoryMap['Air Purifying Plants'],
            images: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Zamioculcas Zamiifolia (ZZ Plant)',
            description: 'Indestructible houseplant with waxy, reflective emerald leaflets along sturdy stems. Endures near-darkness and weeks without water thanks to thick underground water-storing rhizomes.',
            price: 1150,
            originalPrice: 1450,
            discount: 20,
            stock: 22,
            categoryId: categoryMap['Air Purifying Plants'],
            images: [
                'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=800&auto=format&fit=crop&q=80'
            ]
        },

        // Pots & Planters
        {
            name: 'Nordic Ceramic Planter with Wooden Stand (Set of 2)',
            description: 'High-fire minimalist matte-white ceramic pots accompanied by natural beechwood interlocking stands. Includes drainage hole and silicone stopper for pristine indoor surfaces.',
            price: 1750,
            originalPrice: 2200,
            discount: 20,
            stock: 25,
            categoryId: categoryMap['Pots & Planters'],
            images: [
                'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Terracotta Handcrafted Clay Pots (3 Sizes)',
            description: 'Authentic porous earthenware terracotta pots that allow plant roots to breathe and prevent root rot. Handcrafted by local artisans with drainage holes and matching saucers.',
            price: 850,
            originalPrice: 1100,
            discount: 22,
            stock: 35,
            categoryId: categoryMap['Pots & Planters'],
            images: [
                'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Boho Macrame Cotton Plant Hanger with Pot',
            description: 'Hand-woven natural 100% cotton macrame cord with solid wooden ring. Beautifully suspends trailing plants like Pothos or English Ivy in windows and balconies.',
            price: 550,
            originalPrice: 700,
            discount: 21,
            stock: 30,
            categoryId: categoryMap['Pots & Planters'],
            images: [
                'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=800&auto=format&fit=crop&q=80'
            ]
        },

        // Plant Care & Organic Soil
        {
            name: 'Premium Organic Vermicompost Fertilizer (5kg)',
            description: '100% natural organic earthworm castings rich in macro and micro nutrients, enzymes, and beneficial soil microbes. Enhances root development, leaf color, and blossoming without chemical burning.',
            price: 450,
            originalPrice: 600,
            discount: 25,
            stock: 60,
            categoryId: categoryMap['Plant Care & Organic Soil'],
            images: [
                'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Pure Cold-Pressed Neem Oil Spray (500ml)',
            description: 'Natural organic pest repellent and fungicide. Safely protects houseplants against mealybugs, aphids, spider mites, and fungal leaf spot without toxic fumes.',
            price: 380,
            originalPrice: 480,
            discount: 20,
            stock: 40,
            categoryId: categoryMap['Plant Care & Organic Soil'],
            images: [
                'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
            ]
        },
        {
            name: 'Heavy-Duty Brass Botanical Mist Sprayer (300ml)',
            description: 'Vintage-style brass pump mister designed for delicate tropical ferns, orchids, and seedlings requiring gentle humidity. Durable metal nozzle with fine atomized mist.',
            price: 680,
            originalPrice: 850,
            discount: 20,
            stock: 25,
            categoryId: categoryMap['Plant Care & Organic Soil'],
            images: [
                'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'
            ]
        }
    ];

    for (const prod of plantProducts) {
        await prisma.product.create({
            data: prod
        });
        console.log(`🌸 Created Plant: ${prod.name}`);
    }

    console.log(`\n🎉 Green Petals Seeding Finished! Total: ${plantProducts.length} botanical products across ${categories.length} categories.`);
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
