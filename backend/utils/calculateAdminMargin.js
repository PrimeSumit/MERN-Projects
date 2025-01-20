export const calculateAdminMargin = (amount) => {
    if (amount <= 500) return amount * 0.05; // 5%
    if (amount > 500 && amount <= 5000) return amount * 0.1; // 10%
    if (amount > 5000 && amount <= 10000) return amount * 0.12; // 12%
    return amount * 0.15; // 15% for amounts > ₹10000
};
