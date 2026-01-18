import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useUser } from '../hooks/useAuth';
import { useCreateOrder } from '../hooks/useOrders';
import { useToast } from '../components/Toast';
import { createRazorpayOrder, verifyPaymentAndCreateOrder } from '../api/services/payment.service';
import { getShippingCost } from '../api/services/order.service';
import { Lock, ShoppingCart, AlertCircle, User, Truck, CreditCard, ArrowRight, ShieldCheck, Check } from 'lucide-react';

const Skeleton = ({ className }) => (
    <div className={`bg-[#1f2a22] rounded-md animate-pulse ${className}`} />
);

const Checkout = () => {
    const { data: user, isLoading: userLoading } = useUser();
    const { data: cartData, isLoading: cartLoading } = useCart();
    const createOrderMutation = useCreateOrder();
    const navigate = useNavigate();
    const { error: showError } = useToast();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'razorpay'
    });

    const [errors, setErrors] = useState({});
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [setShippingLoading] = useState(true);

    const items = cartData?.items || [];

    const getUnitPrice = (item) => item?.finalPrice ?? item?.price ?? item?.product?.price ?? 0;
    const getImageUrl = (item) => {
        const product = item?.product;
        if (!product) return '';
        
        // Get the variant to check for variant-specific images
        const variant = product?.variants?.find(v => v._id?.toString?.() === item?.variantId?.toString?.());
        
        // Prefer variant images, fallback to product images
        const images = (variant?.images && variant.images.length > 0) 
            ? variant.images 
            : (product.images && product.images.length > 0 ? product.images : []);
        
        if (!images || images.length === 0) return '';
        
        const img = images[0];
        return typeof img === 'string' ? img : img.url || '';
    };

    const cartTotal = items.reduce((acc, item) => acc + (getUnitPrice(item) * item.quantity), 0);
    const shipping = shippingCost;
    const tax = Math.round(cartTotal * 0.18);
    const total = cartTotal + shipping + tax;

    // Fetch shipping cost from backend on mount
    useEffect(() => {
        const fetchShipping = async () => {
            try {
                const response = await getShippingCost();
                setShippingCost(response.data.shipping || 80);
            } catch (err) {
                console.error('Failed to fetch shipping cost:', err);
                setShippingCost(80); // Fallback to 80 if API fails
            } finally {
                setShippingLoading(false);
            }
        };
        fetchShipping();
    }, []);

    // Prefill form with logged-in user details when available
    useEffect(() => {
        if (!user) return;
        setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || user.name?.split(' ')?.[0] || prev.firstName,
            lastName: user.lastName || user.name?.split(' ')?.slice(1).join(' ') || prev.lastName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
            address: user.address?.street || prev.address,
            city: user.address?.city || prev.city,
            state: user.address?.state || prev.state,
            pincode: user.address?.pincode || prev.pincode,
        }));
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const loadRazorpay = () => new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.body.appendChild(script);
    });

    const validateForm = () => {
        const newErrors = {};

        // Validate required fields
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s+/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Enter a valid 6-digit pincode';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) return;
        
        // Validate form before submission
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Set submitting state immediately to disable button
        setIsSubmitting(true);

        const orderData = {
            shippingAddress: {
                // Backend requires name + country
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                country: 'India',
                // Extra fields (ignored by backend schema but kept for UI completeness)
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
            },
            paymentMethod: formData.paymentMethod,
            items: items.map((item) => ({
                productId: item.product?._id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: getUnitPrice(item),
            })),
            totals: {
                subtotal: cartTotal,
                tax,
                shipping,
                total,
            },
        };

        try {
            setErrors({}); // Clear any previous errors

            // ===== NEW PAYMENT FLOW =====
            // Step 1: Create Razorpay order FIRST (without creating DB order)
            const razorpayResponse = await createRazorpayOrder(orderData);
            const razorpayOrder = razorpayResponse?.data?.razorpayOrder;
            const keyId = razorpayResponse?.data?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
            const backendShipping = razorpayResponse?.data?.shipping || 80;

            if (!razorpayOrder || !razorpayOrder.id) {
                throw new Error('Failed to create payment order');
            }

            // Update shipping cost from backend
            setShippingCost(backendShipping);

            // Recalculate total with backend shipping
            const finalTotal = cartTotal + backendShipping + tax;

            // Step 2: Load and open Razorpay payment modal
            await loadRazorpay();

            const rzp = new window.Razorpay({
                key: keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                order_id: razorpayOrder.id,
                name: 'JWC',
                description: `Order - ${razorpayOrder.receipt}`,
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`.trim() || user?.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: {
                    receipt: razorpayOrder.receipt,
                },
                handler: async (response) => {
                    try {
                        // Show loading skeleton immediately
                        setIsProcessingPayment(true);
                        
                        // Step 3: Payment successful - verify and create order
                        // Only after successful payment, create the DB order
                        const verifyResponse = await verifyPaymentAndCreateOrder({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderData: {
                                ...orderData,
                                totals: {
                                    subtotal: cartTotal,
                                    tax,
                                    shipping: backendShipping,
                                    total: finalTotal,
                                },
                            },
                        });

                        const createdOrder = verifyResponse?.data?.order;
                        if (!createdOrder) {
                            throw new Error('Failed to create order after payment');
                        }

                        // Navigate to order success page
                        navigate(`/order/${createdOrder._id}/success`);
                    } catch (err) {
                        setIsProcessingPayment(false);
                        setIsSubmitting(false);
                        const message = err?.response?.data?.message || err.message || 'Payment verification failed. Please contact support.';
                        showError(message);
                        // Order was NOT created, so user can retry
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        showError('Payment cancelled. Your order was not created. Please try again.');
                    },
                },
                theme: {
                    color: '#11d452',
                },
            });

            rzp.open();
        } catch (err) {
            setIsSubmitting(false);
            const errorMessage = err?.response?.data?.message || err.message || 'Checkout failed. Please try again.';
            
            // Check if it's a validation error from backend
            if (err?.response?.data?.errors) {
                const backendErrors = {};
                err.response.data.errors.forEach(error => {
                    // Map backend field names to form field names
                    const field = error.path || error.field;
                    backendErrors[field] = error.message || error.msg;
                });
                setErrors(backendErrors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showError(errorMessage);
            }
        }
    };

    // Show payment processing skeleton
    if (isProcessingPayment) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    {/* Processing Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center animate-pulse">
                            <Check className="text-primary w-12 h-12" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-white text-2xl font-bold mb-2">Processing Payment</h2>
                    <p className="text-[#9db9a6] mb-8">Please wait while we verify your payment and create your order...</p>

                    {/* Progress Skeleton */}
                    <div className="space-y-4">
                        <div className="bg-surface-dark rounded-lg p-4 border border-[#28392e]">
                            <div className="flex items-center gap-3 mb-3">
                                <Skeleton className="w-5 h-5 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <Skeleton className="w-5 h-5 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-5 h-5 rounded-full" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        </div>
                    </div>

                    <p className="text-[#9db9a6] text-sm mt-6">Do not close this page</p>
                </div>
            </div>
        );
    }

    // Show loading state
    if (userLoading || cartLoading) {
        return (
            <div className="mx-auto max-w-300 px-4 py-8 lg:px-0">
                <div className="flex items-center justify-center py-20">
                    <div className="text-white/50 text-lg">Loading checkout...</div>
                </div>
            </div>
        );
    }

    // Show login prompt if user is not authenticated
    if (!user) {
        return (
            <div className="mx-auto max-w-300 px-4 py-8 lg:px-0">
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="text-center max-w-md">
                        <Lock className="text-secondary w-16 h-16 mb-4 mx-auto" />
                        <h2 className="text-white text-2xl font-bold mb-3 font-display">Please Login to Checkout</h2>
                        <p className="text-white/60 mb-6">You need to be logged in to complete your purchase.</p>
                        <div className="flex gap-4 justify-center">
                            <Link 
                                to="/login" 
                                className="px-6 py-3 bg-linear-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="px-6 py-3 bg-[#28392e] hover:bg-[#3b5443] text-white font-bold rounded-lg transition-all"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty cart message
    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-300 px-4 py-8 lg:px-0">
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="text-center max-w-md">
                        <ShoppingCart className="text-secondary w-16 h-16 mb-4 mx-auto" />
                        <h2 className="text-white text-2xl font-bold mb-3 font-display">Your Cart is Empty</h2>
                        <p className="text-white/60 mb-6">Add some items to your cart before checking out.</p>
                        <Link 
                            to="/products" 
                            className="inline-block px-6 py-3 bg-linear-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-300 px-4 py-8 lg:px-0">
            {/* Page Heading */}
            <div className="mb-8">
                <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 font-display">Checkout</h1>
                <p className="text-[#9db9a6] text-base font-normal leading-normal">Complete your order</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Checkout Form */}
                <div className="flex-1 w-full">
                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 bg-red-900/20 border border-red-500 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500" />
                                <div>
                                    <h3 className="text-red-500 font-bold mb-2">Please fix the following errors:</h3>
                                    <ul className="text-red-400 text-sm space-y-1 list-disc list-inside">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Contact Information */}
                        <div className="bg-surface-dark rounded-xl border border-[#28392e] p-6">
                            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                                <User className="text-secondary" />
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                        placeholder="John"
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                        placeholder="Doe"
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Phone *</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        minLength={10}
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border ${errors.phone ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                        placeholder="9876543210"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-surface-dark rounded-xl border border-[#28392e] p-6">
                            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                                <Truck className="text-secondary" />
                                Shipping Address
                            </h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Street Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border ${errors.address ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                        placeholder="123 Fashion Street"
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-white text-sm font-medium mb-2 block">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-lg border ${errors.city ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                            placeholder="Mumbai"
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="text-white text-sm font-medium mb-2 block">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-lg border ${errors.state ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                            placeholder="Maharashtra"
                                        />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <label className="text-white text-sm font-medium mb-2 block">PIN Code *</label>
                                        <input
                                            type="tel"
                                            maxLength={6}
                                            minLength={6}
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-lg border ${errors.pincode ? 'border-red-500' : 'border-[#28392e]'} bg-[#1a261e] text-white px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all`}
                                            placeholder="400001"
                                        />
                                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Razorpay Payment */}
                        <div className="bg-surface-dark rounded-xl border border-[#28392e] p-6">
                            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="text-secondary" />
                                Pay Securely with Razorpay
                            </h2>
                            <div className="flex flex-col gap-3 text-white/80 text-sm">
                                <p className="leading-relaxed">
                                    We will redirect you to Razorpay to complete the payment securely using cards, UPI, or net banking.
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-6 bg-white rounded px-2 py-1" />
                                    {/* <span className="text-xs text-white/60">PCI-DSS compliant • 256-bit SSL</span> */}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-95 shrink-0 lg:sticky lg:top-24">
                    <div className="flex flex-col gap-6 rounded-xl border border-solid border-[#3b5443] bg-surface-dark p-6 shadow-xl">
                        <h2 className="text-white text-xl font-bold leading-tight font-display pb-4 border-b border-[#28392e]">Order Summary</h2>

                        {/* Cart Items */}
                        <div className="flex flex-col gap-3 pb-4 border-b border-[#28392e] max-h-75 overflow-y-auto">
                            {items.map((item, idx) => (
                                <div key={`${item.product?._id || 'product'}-${item.variantId || 'variant'}-${idx}`} className="flex gap-3">
                                    <div className="w-16 h-20 rounded bg-[#28392e] overflow-hidden shrink-0">
                                        <img 
                                            src={getImageUrl(item)} 
                                            alt={item.product?.name || 'Product'} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{item.product?.name}</p>
                                        <p className="text-[#9db9a6] text-xs">Size: {item.size} | Qty: {item.quantity}</p>
                                        <p className="text-secondary text-sm font-bold mt-1">₹{(getUnitPrice(item) * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Calculations */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-white/70 text-sm">
                                <span>Subtotal</span>
                                <span className="text-white">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white/70 text-sm">
                                <span>Shipping</span>
                                <span className="text-white">
                                    {shippingCost === 0 ? (
                                        <span className="text-primary">Free</span>
                                    ) : (
                                        `₹${shippingCost.toLocaleString()}`
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between text-white/70 text-sm">
                                <span>Taxs & Charges</span>
                                <span className="text-white">₹{tax.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-[#28392e] pt-4">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-white text-base font-bold">Total Amount</span>
                                <span className="text-secondary text-2xl font-black font-display tracking-tight">₹{total.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-[#5e7668] text-right">Including all taxes</p>
                        </div>

                        {/* Place Order Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={createOrderMutation.isPending || isSubmitting}
                            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] py-4 text-[#0f1c15] shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 text-base font-bold uppercase tracking-widest flex items-center gap-2">
                                {createOrderMutation.isPending || isSubmitting ? 'Processing...' : 'Place Order'}
                                {!createOrderMutation.isPending && !isSubmitting && (
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                )}
                            </span>
                        </button>

                        {/* Trust badges */}
                        <div className="flex justify-center gap-3 pt-2 opacity-60">
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                                <Lock className="w-4 h-4" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                                <ShieldCheck className="w-4 h-4" />
                                <span>100% Authentic</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
