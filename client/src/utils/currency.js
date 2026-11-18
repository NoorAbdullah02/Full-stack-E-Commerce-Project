// Currency formatting utility for Bangladeshi Taka
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === '') {
        return '৳0.00';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount)) {
        return '৳0.00';
    }
    return `৳${numAmount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyShort = (amount) => {
    if (amount === undefined || amount === null || amount === '') {
        return '৳0';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount)) {
        return '৳0';
    }
    return `৳${numAmount.toLocaleString('en-BD')}`;
};
