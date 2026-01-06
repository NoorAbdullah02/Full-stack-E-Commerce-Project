// Currency formatting utility for Bangladeshi Taka
export const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `৳${numAmount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyShort = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `৳${numAmount.toLocaleString('en-BD')}`;
};
