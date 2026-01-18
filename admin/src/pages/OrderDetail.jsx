import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const formatCurrency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
})}`;

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (err) {
        return value;
    }
};

const statusOptions = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];

const statusDescription = {
    pending: 'Order placed but not yet confirmed',
    confirmed: 'Order confirmed and awaiting processing',
    processing: 'Order is being prepared',
    packed: 'Order is packed and ready to ship',
    shipped: 'Order is in transit to customer',
    delivered: 'Order delivered to customer',
    cancelled: 'Order has been cancelled',
    returned: 'Product returned by customer',
    refunded: 'Refund processed for customer'
};

const statusIcons = {
    pending: <Clock size={20} className="text-amber-500" />,
    confirmed: <CheckCircle size={20} className="text-blue-500" />,
    processing: <Package size={20} className="text-blue-500" />,
    packed: <Package size={20} className="text-indigo-500" />,
    shipped: <Truck size={20} className="text-indigo-500" />,
    delivered: <CheckCircle size={20} className="text-emerald-500" />,
    returned: <AlertCircle size={20} className="text-orange-500" />,
    cancelled: <AlertCircle size={20} className="text-rose-500" />,
    refunded: <CheckCircle size={20} className="text-purple-500" />
};

const statusBgColor = {
    pending: 'bg-amber-50 border-amber-200',
    confirmed: 'bg-blue-50 border-blue-200',
    processing: 'bg-blue-50 border-blue-200',
    packed: 'bg-indigo-50 border-indigo-200',
    shipped: 'bg-indigo-50 border-indigo-200',
    delivered: 'bg-emerald-50 border-emerald-200',
    returned: 'bg-orange-50 border-orange-200',
    cancelled: 'bg-rose-50 border-rose-200',
    refunded: 'bg-purple-50 border-purple-200'
};

const statusTextColor = {
    pending: 'text-amber-700',
    confirmed: 'text-blue-700',
    processing: 'text-blue-700',
    packed: 'text-indigo-700',
    shipped: 'text-indigo-700',
    delivered: 'text-emerald-700',
    returned: 'text-orange-700',
    cancelled: 'text-rose-700',
    refunded: 'text-purple-700'
};

// Valid status transitions
const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['returned'],
    cancelled: [],
    returned: [],
    refunded: [],
};

const getValidNextStatuses = (currentStatus) => {
    return validTransitions[currentStatus] || [];
};

const OrderDetail = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const { success: showSuccess, error: showError } = useToast();

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminApi.getOrder(orderId);
            const loadedOrder = data?.order || data;
            setOrder(loadedOrder);
            setSelectedStatus(loadedOrder?.status || 'pending');
        } catch (err) {
            const errorMessage = err.message || 'Failed to load order details';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedStatus || selectedStatus === order?.status) {
            showError('Please select a different status');
            return;
        }

        setUpdating(true);
        try {
            const response = await adminApi.updateOrderStatus(orderId, {
                status: selectedStatus,
                note: statusNote
            });
            
            setOrder(response?.order || response);
            setStatusNote('');
            showSuccess('Order status updated successfully!');
        } catch (err) {
            const errorMessage = err.message || 'Failed to update order status';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader label="Loading order details..." />
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Orders
                </button>
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    if (!order) return null;

    const orderId_display = order.orderNumber || order._id;
    const customer = order.user;
    const shipping = order.shippingAddress || order.address;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/orders')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Order #{orderId_display}</h1>
                    <p className="text-slate-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Update Card */}
                    <div className={`rounded-2xl border p-6 ${statusBgColor[order.status]}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {statusIcons[order.status]}
                            <div>
                                <p className={`text-sm font-semibold uppercase tracking-wide ${statusTextColor[order.status]}`}>
                                    Current Status
                                </p>
                                <p className={`text-2xl font-bold ${statusTextColor[order.status]}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600">{statusDescription[order.status]}</p>
                    </div>

                    {/* Status Workflow Guide */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                        <h3 className="font-bold mb-4 text-slate-900">Order Status Workflow</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                <span className="text-xs font-semibold text-slate-600">Main Flow:</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Pending</span>
                                <span className="text-slate-400">→</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Confirmed</span>
                                <span className="text-slate-400">→</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Processing</span>
                                <span className="text-slate-400">→</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">Packed</span>
                                <span className="text-slate-400">→</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">Shipped</span>
                                <span className="text-slate-400">→</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Delivered</span>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-300">
                                <span className="text-xs font-semibold text-slate-600">Optional:</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Delivered</span>
                                <span className="text-slate-400">→</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">Returned</span>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-300">
                                <span className="text-xs font-semibold text-slate-600">Any Stage:</span>
                                <span className="whitespace-nowrap px-3 py-1 bg-rose-100 text-rose-700 rounded text-xs font-semibold">Cancelled</span>
                            </div>
                        </div>
                    </div>

                    {/* Update Status Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">Update Order Status</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Current: <span className="font-semibold">{order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}</span> 
                            {getValidNextStatuses(order?.status).length > 0 && (
                                <span> → Can change to: <span className="font-semibold text-blue-600">{getValidNextStatuses(order?.status).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</span></span>
                            )}
                        </p>
                        <div className="space-y-4">
                            {getValidNextStatuses(order?.status).length > 0 ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            New Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select new status</option>
                                            {getValidNextStatuses(order?.status).map(status => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)} - {statusDescription[status]}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedStatus && (
                                            <p className="text-sm text-slate-600 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                ✓ {statusDescription[selectedStatus]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Status Note (Optional)
                                        </label>
                                        <textarea
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., Item shipped via courier, tracking: ABC123"
                                        />
                                    </div>

                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={updating || !selectedStatus}
                                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Update Status
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-slate-600">
                                        ✓ This order is in a final state ({order?.status}) and cannot be changed further.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">Order Items</h2>
                        <div className="space-y-3">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 pb-3 border-b border-slate-100 last:border-b-0">
                                    {item.product?.images?.[0]?.url || item.productImage ? (
                                        <img
                                            src={item.product?.images?.[0]?.url || item.productImage}
                                            alt={item.product?.name || item.productName}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Package size={24} className="text-slate-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.product?.name || item.productName}</p>
                                        <p className="text-sm text-slate-500">
                                            Size: {item.variantDetails?.size || item.size || 'N/A'} | Color: {item.variantDetails?.color || item.color || 'N/A'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Quantity: {item.quantity} × {formatCurrency(item.finalPrice || item.price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency((item.finalPrice || item.price) * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
                        <div className="space-y-2 text-sm">
                            <p className="font-semibold">{shipping?.name || customer?.name}</p>
                            <p className="text-slate-600">{shipping?.address || 'N/A'}</p>
                            <p className="text-slate-600">
                                {shipping?.city && `${shipping.city}, `}
                                {shipping?.state && `${shipping.state} `}
                                {shipping?.pincode}
                            </p>
                            <p className="text-slate-600 pt-2">
                                <strong>Phone:</strong> {shipping?.phone || customer?.phone || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold mb-4">Customer Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500">Name</p>
                                <p className="font-semibold">{customer?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Email</p>
                                <p className="font-semibold break-all">{customer?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Phone</p>
                                <p className="font-semibold">{customer?.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-semibold">{formatCurrency(order.pricing?.subtotal || order.subtotal)}</span>
                            </div>
                            {order.pricing?.discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.pricing?.discount || 0)}</span>
                                </div>
                            )}
                            {order.pricing?.shippingCost > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Shipping</span>
                                    <span className="font-semibold">{formatCurrency(order.pricing?.shippingCost || 0)}</span>
                                </div>
                            )}
                            {order.pricing?.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tax</span>
                                    <span className="font-semibold">{formatCurrency(order.pricing?.tax || 0)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-lg">{formatCurrency(order.pricing?.finalAmount || order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold mb-4">Payment Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500">Method</p>
                                <p className="font-semibold capitalize">{order.paymentMethod || order.payment?.method || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Status</p>
                                <p className={`font-semibold ${order.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {order.paymentStatus || order.payment?.status || 'N/A'}
                                </p>
                            </div>
                            {order.payment?.razorpayOrderId && (
                                <div>
                                    <p className="text-slate-500">Razorpay Order ID</p>
                                    <p className="font-mono text-xs break-all">{order.payment.razorpayOrderId}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
