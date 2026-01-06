const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'noor@admin.com';
    const password = 'noorabdullah';
    const name = 'Admin Noor';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            email: email,
            name: name,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log(`Admin user upserted: ${user.email}`);

    // Optional: Demote others or ensure only this one is admin?
    // For now, let's just ensure THIS one exists as requested.
    // The user said "only this email ... is access for the admin".
    // This implies we should maybe demote others or delete them?
    // Safest bet is to check if any other admins exist and warn or demote.

    const otherAdmins = await prisma.user.findMany({
        where: {
            role: 'ADMIN',
            email: { not: email }
        }
    });

    if (otherAdmins.length > 0) {
        console.log(`Found ${otherAdmins.length} other admins. Demoting them to USER...`);
        await prisma.user.updateMany({
            where: {
                role: 'ADMIN',
                email: { not: email }
            },
            data: { role: 'USER' }
        });
        console.log('Other admins demoted.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
