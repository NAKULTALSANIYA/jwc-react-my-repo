import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import { CheckCircle, Info, Mail } from 'lucide-react';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const { data: orderData, isLoading } = useOrder(orderId);
    const order = orderData?.order;

    const getImageUrl = (item) => {
        const product = item?.product;
        if (!product) return null;
        
        // Get the variant to check for variant-specific images
        const variant = product?.variants?.find(v => v._id?.toString?.() === item?.variantId?.toString?.());
        
        // Prefer variant images, fallback to product images
        const images = (variant?.images && variant.images.length > 0) 
            ? variant.images 
            : (product.images && product.images.length > 0 ? product.images : []);
        
        if (!images || images.length === 0) return null;
        
        const img = images[0];
        return typeof img === 'string' ? img : img.url || null;
    };

    useEffect(() => {
        // Clear any stored cart data on success
        localStorage.removeItem('jwc_cart_data');
    }, []);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-0">
                <div className="flex items-center justify-center py-20">
                    <div className="text-white/50 text-lg">Loading order details...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-0">
            <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className="text-center max-w-2xl">
                    {/* Success Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50 flex items-center justify-center">
                            <CheckCircle className="text-green-500 w-16 h-16" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-3 font-display">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-white/70 text-lg mb-2">
                        Thank you for your purchase
                    </p>

                    {/* Order Details Card */}
                    {order && (
                        <div className="bg-surface-dark rounded-xl border border-[#28392e] p-6 mt-8 text-left">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center pb-4 border-b border-[#28392e]">
                                    <div>
                                        <p className="text-white/60 text-sm">Order Number</p>
                                        <p className="text-white text-xl font-bold font-display">{order.orderNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-sm">Total Amount</p>
                                        <p className="text-secondary text-2xl font-black font-display">₹{order.pricing?.finalAmount?.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-sm mb-1">Payment Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.paymentStatus === 'paid' 
                                                    ? 'bg-green-500/20 text-green-500' 
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {order.paymentStatus?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm mb-1">Order Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500">
                                                {order.status?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Payment Warning */}
                                {order.paymentStatus === 'pending' && (
                                    <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mt-4">
                                        <div className="flex gap-3">
                                            <Info className="text-yellow-500 shrink-0" />
                                            <div className="text-left">
                                                <p className="text-yellow-500 font-bold text-sm mb-1">Payment Pending</p>
                                                <p className="text-yellow-400 text-xs leading-relaxed">
                                                    Your order has been created, but the payment is still pending verification. If money has been debited from your account, it will be automatically refunded within <span className="font-bold">7-10 business days</span>. You will receive an email confirmation once the refund is processed.
                                                </p>
                                                {order.refundInfo?.estimatedRefundDate && (
                                                    <p className="text-yellow-400 text-xs mt-2">
                                                        Estimated refund date: <span className="font-bold">{new Date(order.refundInfo.estimatedRefundDate).toLocaleDateString()}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                

                                <div>
                                    <p className="text-white/60 text-sm mb-1">Shipping Address</p>
                                    <p className="text-white text-sm">
                                        {order.shippingAddress?.name}<br />
                                        {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                                        {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                                        {order.shippingAddress?.country}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-white/60 text-sm mb-2">Items ({order.items?.length})</p>
                                    <div className="flex flex-col gap-2">
                                        {order.items?.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm">
                                                <div className="w-12 h-16 rounded bg-[#28392e] overflow-hidden shrink-0">
                                                    {getImageUrl(item) && (
                                                        <img 
                                                            src={getImageUrl(item)} 
                                                            alt={item.productName} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{item.productName}</p>
                                                    <p className="text-white/60 text-xs">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-secondary font-bold">₹{item.totalPrice?.toLocaleString()}</p>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <p className="text-white/60 text-xs">+ {order.items.length - 3} more items</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link 
                            to="/profile?tab=orders" 
                            className="px-6 py-3 bg-gradient-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all"
                        >
                            View All Orders
                        </Link>
                        <Link 
                            to="/" 
                            className="px-6 py-3 bg-[#28392e] hover:bg-[#3b5443] text-white font-bold rounded-lg transition-all"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 p-4 bg-[#1a261e] rounded-lg border border-[#28392e]">
                        <p className="text-white/60 text-sm">
                            <Mail className="inline w-4 h-4 align-middle mr-1" />
                            A confirmation email has been sent to <span className="text-white font-medium">{order?.shippingAddress?.email}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
