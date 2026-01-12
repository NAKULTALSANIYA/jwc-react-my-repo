import axiosInstance from '../axios';

// Create/verify payments
export const verifyPayment = async (payload) => {
  const response = await axiosInstance.post('/payments/verify', payload);
  return response.data;
};
/**
 * NEW PAYMENT FLOW
 */

// Step 1: Create Razorpay order (without creating DB order)
export const createRazorpayOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders/payment/create-razorpay-order', orderData);
  return response.data;
};

// Step 2: Verify payment signature and create order
export const verifyPaymentAndCreateOrder = async (paymentVerificationData) => {
  const response = await axiosInstance.post('/orders/payment/verify-and-create', paymentVerificationData);
  return response.data;
};