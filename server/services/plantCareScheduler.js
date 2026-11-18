const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendDay7PlantCareReminder, sendDay30PlantCareReminder } = require('./emailService');

const runPlantCareCheck = async () => {
    try {
        console.log('🌿 [Plant Care Scheduler] Checking delivered orders for Day 7 & Day 30 care reminders...');

        const deliveredOrders = await prisma.order.findMany({
            where: { status: 'DELIVERED' },
            include: {
                user: true,
                items: { include: { product: true } }
            }
        });

        const now = Date.now();
        let day7SentCount = 0;
        let day30SentCount = 0;

        for (const order of deliveredOrders) {
            let addr = {};
            if (order.shippingAddress) {
                if (typeof order.shippingAddress === 'object') {
                    addr = { ...order.shippingAddress };
                } else if (typeof order.shippingAddress === 'string') {
                    try { addr = JSON.parse(order.shippingAddress); } catch { addr = {}; }
                }
            }

            const careLogs = addr.careLogs || {};
            const deliveredDate = new Date(order.updatedAt || order.createdAt).getTime();
            const daysElapsed = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));

            // Day 7 Window (6 to 12 days post delivery)
            if (daysElapsed >= 6 && daysElapsed <= 14 && !careLogs.day7SentAt) {
                try {
                    await sendDay7PlantCareReminder(order, order.user);
                    careLogs.day7SentAt = new Date().toISOString();
                    careLogs.day7Channel = 'AUTOMATED_EMAIL';
                    addr.careLogs = careLogs;

                    await prisma.order.update({
                        where: { id: order.id },
                        data: { shippingAddress: addr }
                    });
                    day7SentCount++;
                    console.log(`✅ [Plant Care] Day 7 email sent for Order #${order.id.slice(0, 8)} to ${order.user?.email}`);
                } catch (err) {
                    console.error(`❌ [Plant Care] Day 7 email failed for Order #${order.id}:`, err.message);
                }
            }

            // Day 30 Window (28 to 38 days post delivery)
            if (daysElapsed >= 28 && daysElapsed <= 45 && !careLogs.day30SentAt) {
                try {
                    await sendDay30PlantCareReminder(order, order.user);
                    careLogs.day30SentAt = new Date().toISOString();
                    careLogs.day30Channel = 'AUTOMATED_EMAIL';
                    addr.careLogs = careLogs;

                    await prisma.order.update({
                        where: { id: order.id },
                        data: { shippingAddress: addr }
                    });
                    day30SentCount++;
                    console.log(`✅ [Plant Care] Day 30 email sent for Order #${order.id.slice(0, 8)} to ${order.user?.email}`);
                } catch (err) {
                    console.error(`❌ [Plant Care] Day 30 email failed for Order #${order.id}:`, err.message);
                }
            }
        }

        console.log(`🌿 [Plant Care Scheduler] Summary: ${day7SentCount} Day-7 and ${day30SentCount} Day-30 care reminders processed.`);
    } catch (error) {
        console.error('❌ [Plant Care Scheduler Error]:', error.message);
    }
};

const initPlantCareScheduler = () => {
    // Initial check 10 seconds after server boots
    setTimeout(() => {
        runPlantCareCheck();
    }, 10000);

    // Recurring check every 12 hours
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    setInterval(() => {
        runPlantCareCheck();
    }, TWELVE_HOURS);

    console.log('🌱 [Plant Care Scheduler] Service initialized (Interval: 12 hours).');
};

module.exports = { initPlantCareScheduler, runPlantCareCheck };
