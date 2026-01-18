import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Eye,
    Clock
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { getAdminSocket } from '../api/socket';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { SkeletonTableRow } from '../components/Skeleton';
import { useToast } from '../components/Toast';

const formatCurrency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
})}`;

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (err) {
        return value;
    }
};

const Orders = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { success: showSuccess, error: showError } = useToast();

    const exportOrders = () => {
        try {
            const rows = (orders || []).map((order) => ({
                'Order ID': order._id || order.id || '',
                'Order Number': order.orderNumber || order._id || order.id || '',
                'Customer': order.user?.name || 'Guest user',
                'Email': order.user?.email || '',
                'Phone': order.user?.phone || '',
                'Item Count': Array.isArray(order.items) ? order.items.length : 0,
                'First Product': order.items?.[0]?.product?.name || order.items?.[0]?.productName || '',
                'Date': formatDate(order.createdAt || order.created_at),
                'Amount (INR)': Number(order.pricing?.finalAmount ?? order.pricing?.totalAmount ?? order.total ?? 0),
                'Status': order.status || 'pending',
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

            const filename = `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(workbook, filename);
        } catch (e) {
            // Handle error silently
        }
    };

    useEffect(() => {
        let active = true;

        const loadOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await adminApi.orders({ limit: 25 });
                if (!active) return;
                setOrders(data?.orders || data || []);
            } catch (err) {
                if (active) {
                    const errorMessage = err.message || 'Unable to load orders';
                    setError(errorMessage);
                    showError(errorMessage);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadOrders();

        return () => {
            active = false;
        };
    }, []);

    // Listen for live order events and keep the list in sync without reloads
    useEffect(() => {
        if (!token) return undefined;

        const socket = getAdminSocket(token);
        const getId = (order) => order?._id || order?.id || order?.orderNumber;

        const handleOrderCreated = ({ order }) => {
            if (!order) return;
            setOrders((prev) => {
                const incomingId = getId(order);
                const filtered = prev.filter((item) => getId(item) !== incomingId);
                return [order, ...filtered];
            });
        };

        const handleOrderUpdated = ({ order }) => {
            if (!order) return;
            setOrders((prev) => {
                const incomingId = getId(order);
                const exists = prev.some((item) => getId(item) === incomingId);
                if (!exists) return [order, ...prev];
                return prev.map((item) => (getId(item) === incomingId ? order : item));
            });
        };

        const handleSocketError = () => {
            setError((prev) => prev || 'Live updates are unavailable right now.');
        };

        socket.on('order:created', handleOrderCreated);
        socket.on('order:updated', handleOrderUpdated);
        socket.on('connect_error', handleSocketError);

        return () => {
            socket.off('order:created', handleOrderCreated);
            socket.off('order:updated', handleOrderUpdated);
            socket.off('connect_error', handleSocketError);
        };
    }, [token]);

    const filteredOrders = orders.filter(order => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const orderId = (order._id || order.id || '').toString();
        const orderNumber = (order.orderNumber || '').toString();
        const customerName = (order.user?.name || 'Guest user').toLowerCase();
        const customerEmail = (order.user?.email || '').toLowerCase();

        const matchesSearch = searchLower === '' || 
            orderId.includes(searchLower) || 
            orderNumber.includes(searchLower) || 
            customerName.includes(searchLower) ||
            customerEmail.includes(searchLower);

        if (!matchesSearch) return false;

        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }

        // Date range filter
        if (dateRange.start || dateRange.end) {
            const orderDate = new Date(order.createdAt || order.created_at);
            if (dateRange.start) {
                const startDate = new Date(dateRange.start);
                startDate.setHours(0, 0, 0, 0);
                if (orderDate < startDate) return false;
            }
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                if (orderDate > endDate) return false;
            }
        }

        return true;
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-slate-500">Track and manage customer orders and shipments.</p>
                </div>
                <button
                    onClick={exportOrders}
                    disabled={loading || orders.length === 0}
                    className={`bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                        loading || orders.length === 0 ? 'opacity-60 cursor-not-allowed hover:bg-slate-900 active:scale-100' : ''
                    }`}
                >
                    <Download size={20} />
                    Export Orders
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 w-80">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                <Filter size={16} />
                                Status
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-40 hidden group-hover:block">
                                <button 
                                    onClick={() => setStatusFilter('all')}
                                    className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    All Orders
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('pending')}
                                    className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'pending' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Pending
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('confirmed')}
                                    className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'confirmed' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Confirmed
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('processing')}
                                    className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'processing' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Processing
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('shipped')}
                                    className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'shipped' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Shipped
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('delivered')}
                                    className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'delivered' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Delivered
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('cancelled')}
                                    className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'cancelled' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Cancelled
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                <Clock size={16} />
                                Date Range
                            </button>
                            {showDatePicker && (
                                <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-40 w-72">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => {
                                                    setDateRange({ start: '', end: '' });
                                                    setShowDatePicker(false);
                                                }}
                                                className="flex-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-50"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => setShowDatePicker(false)}
                                                className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && (
                                <>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <SkeletonTableRow key={i} columns={7} />
                                    ))}
                                </>
                            )}
                            {error && !loading && (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-rose-600" colSpan={7}>{error}</td>
                                </tr>
                            )}
                            {!loading && !error && orders.length === 0 && (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-500" colSpan={7}>No orders found.</td>
                                </tr>
                            )}
                            {filteredOrders.map((order) => {
                                const orderId = order._id || order.id; // Use MongoDB ID for routing
                                const orderNumber = order.orderNumber || order._id || order.id; // Display order number
                                const customer = order.user?.name || 'Guest user';
                                const product = order.items?.[0]?.product?.name || order.items?.[0]?.productName || '—';
                                const amount = formatCurrency(order.pricing?.finalAmount || order.pricing?.totalAmount || order.total || 0);
                                const status = order.status || 'pending';

                                const statusColor = status === 'delivered'
                                    ? 'text-emerald-500'
                                    : status === 'processing' || status === 'confirmed'
                                        ? 'text-blue-500'
                                        : status === 'pending'
                                            ? 'text-amber-500'
                                            : 'text-rose-500';

                                return (
                                    <tr key={orderId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-sm">#{orderId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-sm">{customer}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{product}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500">{formatDate(order.createdAt || order.created_at)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{amount}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${statusColor.replace('text', 'bg')}`} />
                                                <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                                    {status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => navigate(`/order-detail/${orderId}`)}
                                                className="flex items-center gap-1 text-blue-600 font-semibold text-sm hover:underline"
                                            >
                                                <Eye size={16} />
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;
