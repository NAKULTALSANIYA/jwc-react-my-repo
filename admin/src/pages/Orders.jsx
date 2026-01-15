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
import Loader from '../components/Loader';
import * as XLSX from 'xlsx';

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
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                    setError(err.message || 'Unable to load orders');
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
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <Filter size={16} />
                            Status
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <Clock size={16} />
                            Date Range
                        </button>
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
                                <tr>
                                    <td className="px-6 py-4" colSpan={7}>
                                        <Loader label="Loading orders" />
                                    </td>
                                </tr>
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
                            {orders.map((order) => {
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
