const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // First, create categories
    const electronics = await prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {},
        create: { name: 'Electronics' }
    });

    const accessories = await prisma.category.upsert({
        where: { name: 'Accessories' },
        update: {},
        create: { name: 'Accessories' }
    });

    console.log('Categories created');

    // Create sample products
    const products = [
        {
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
            price: 299.99,
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
            stock: 50,
            categoryId: electronics.id
        },
        {
            name: 'Smart Watch',
            description: 'Feature-packed smartwatch with health tracking and notifications',
            price: 399.99,
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
            stock: 30,
            categoryId: electronics.id
        },
        {
            name: 'Laptop Backpack',
            description: 'Durable water-resistant backpack with laptop compartment',
            price: 79.99,
            images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
            stock: 100,
            categoryId: accessories.id
        },
        {
            name: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse with precision tracking',
            price: 49.99,
            images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
            stock: 75,
            categoryId: electronics.id
        },
        {
            name: 'USB-C Hub',
            description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
            price: 59.99,
            images: ['https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'],
            stock: 60,
            categoryId: accessories.id
        },
        {
            name: 'Portable Charger',
            description: '20000mAh portable charger with fast charging',
            price: 39.99,
            images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'],
            stock: 120,
            categoryId: electronics.id
        }
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product
        });
        console.log(`Created product: ${product.name}`);
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
