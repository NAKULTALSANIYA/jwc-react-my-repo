import crypto from 'crypto';

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export const calculateDiscountedPrice = (price, discount) => {
  return price - (price * discount) / 100;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const generateOrderId = () => {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const generateInvoiceNumber = () => {
  return 'INV' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};
