const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
    // Electronics
    'Smartphones',
    'Laptops & Computers',
    'Tablets',
    'Cameras',
    'Audio & Headphones',
    'Smart Home',
    'Gaming',
    'Wearables',

    // Fashion
    'Men\'s Clothing',
    'Women\'s Clothing',
    'Kids\' Clothing',
    'Shoes',
    'Bags & Luggage',
    'Watches',
    'Jewelry',
    'Sunglasses',

    // Home & Living
    'Furniture',
    'Home Decor',
    'Kitchen & Dining',
    'Bedding',
    'Bath',
    'Lighting',
    'Storage & Organization',
    'Garden & Outdoor',

    // Beauty & Personal Care
    'Skincare',
    'Makeup',
    'Haircare',
    'Fragrances',
    'Personal Care',

    // Sports & Fitness
    'Exercise Equipment',
    'Sports Apparel',
    'Outdoor Recreation',
    'Cycling',
    'Yoga & Pilates',

    // Books & Media
    'Books',
    'E-books',
    'Music',
    'Movies & TV',

    // Toys & Baby
    'Toys',
    'Baby Products',
    'Baby Clothing',

    // Food & Beverages
    'Groceries',
    'Snacks',
    'Beverages',
    'Health Foods',

    // Automotive
    'Car Accessories',
    'Motorcycle Accessories',

    // Office & Stationery
    'Office Supplies',
    'Office Furniture',
    'Art Supplies',

    // Pet Supplies
    'Pet Food',
    'Pet Accessories',
];

async function seedCategories() {
    console.log('🌱 Seeding categories...');

    try {
        // Create categories
        let created = 0;
        let updated = 0;

        for (const name of categories) {
            const result = await prisma.category.upsert({
                where: { name },
                update: {},
                create: { name },
            });

            if (result) {
                const existing = await prisma.category.findUnique({ where: { name } });
                if (existing) {
                    updated++;
                } else {
                    created++;
                }
            }
        }

        console.log(`✅ Successfully processed ${categories.length} categories!`);
        console.log(`   - Created: ${created}`);
        console.log(`   - Already existed: ${updated}`);
        console.log('\nAll categories:');
        categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat}`);
        });

    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedCategories()
        .then(() => {
            console.log('\n🎉 Category seeding completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed to seed categories:', error);
            process.exit(1);
        });
}

module.exports = { seedCategories };
