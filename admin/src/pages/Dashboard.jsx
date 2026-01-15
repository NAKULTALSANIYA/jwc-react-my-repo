import React, { useEffect, useMemo, useState } from 'react';
import {
    IndianRupee,
    ShoppingBag,
    Users,
    Briefcase,
    ArrowUpRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import StatCard from '../components/StatCard';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
})}`;

const formatChange = (value) => {
    if (value === undefined || value === null) return '0%';
    const numeric = Number(value) || 0;
    const prefix = numeric > 0 ? '+' : '';
    return `${prefix}${numeric}%`;
};

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timePeriod, setTimePeriod] = useState('1month');

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError('');

            try {
                const now = new Date();
                let startDate, endDate = now.toISOString();
                let period = 'daily';

                // Calculate date range based on selected period
                switch (timePeriod) {
                    case '7days':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
                        period = 'daily';
                        break;
                    case '15days':
                        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
                        period = 'daily';
                        break;
                    case '1month':
                        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
                        period = 'daily';
                        break;
                    case '6months':
                        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();
                        period = 'monthly';
                        break;
                    case '1year':
                        startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString();
                        period = 'monthly';
                        break;
                    case 'all':
                        startDate = new Date(2020, 0, 1).toISOString();
                        period = 'monthly';
                        break;
                    default:
                        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
                        period = 'daily';
                }

                const [summaryRes, revenueRes, recentRes] = await Promise.all([
                    adminApi.dashboardSummary(),
                    adminApi.revenueByPeriod({ period, startDate, endDate }),
                    adminApi.recentOrders(6),
                ]);

                if (!active) return;

                const summaryData = summaryRes || {
                    quickStats: {
                        totalRevenue: 0,
                        totalOrders: 0,
                        totalCustomers: 0,
                        lowStockProducts: 0,
                        avgOrderValue: 0
                    },
                    growth: {
                        revenue: 0,
                        orders: 0,
                        customers: 0
                    }
                };
                setSummary(summaryData);

                // Format revenue data based on period type
                const revenueData = revenueRes?.revenue || revenueRes || [];
                const revenueList = revenueData.map((entry) => {
                    let name;
                    if (period === 'monthly') {
                        const monthIndex = (entry.month ?? entry._id ?? 1) - 1;
                        name = monthNames[monthIndex] || `M${entry.month || entry._id || ''}`;
                    } else {
                        // For daily, show date
                        if (entry.date) {
                            const d = new Date(entry.date);
                            name = `${d.getDate()}/${d.getMonth() + 1}`;
                        } else {
                            name = entry._id || 'Day';
                        }
                    }
                    return {
                        name,
                        sales: entry.revenue ?? entry.total ?? 0,
                    };
                });

                setRevenue(revenueList);
                setRecentOrders(recentRes?.orders || recentRes || []);
            } catch (err) {
                if (active) {
                    setError(err.message || 'Unable to load dashboard data');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [timePeriod]);

    const quickStats = summary?.quickStats || {};
    const growth = summary?.growth || {};

    const statCards = useMemo(() => ([
        {
            label: 'Total Revenue',
            value: formatCurrency(quickStats?.totalRevenue || 0),
            change: formatChange(growth?.revenue),
            isPositive: (growth?.revenue ?? 0) >= 0,
            icon: <IndianRupee size={24} />,
        },
        {
            label: 'Total Orders',
            value: (quickStats?.totalOrders || 0).toLocaleString('en-IN'),
            change: formatChange(growth?.orders),
            isPositive: (growth?.orders ?? 0) >= 0,
            icon: <ShoppingBag size={24} />,
        },
        {
            label: 'Total Customers',
            value: (quickStats?.totalCustomers || 0).toLocaleString('en-IN'),
            change: formatChange(growth?.customers),
            isPositive: (growth?.customers ?? 0) >= 0,
            icon: <Users size={24} />,
        },
        {
            label: 'Low Stock Products',
            value: (quickStats?.lowStockProducts || 0).toLocaleString('en-IN'),
            change: 'Inventory',
            isPositive: false,
            icon: <Briefcase size={24} />,
        },
    ]), [growth?.customers, growth?.orders, growth?.revenue, quickStats?.lowStockProducts, quickStats?.totalCustomers, quickStats?.totalOrders, quickStats?.totalRevenue]);

    const chartData = revenue.length
        ? revenue
        : monthNames.map((name) => ({ name, sales: 0 }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-slate-500">Live metrics fetched from the backend.</p>
                </div>
                {error && (
                    <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-w-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Sales Overview</h3>
                        <select
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-700 cursor-pointer"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="15days">Last 15 Days</option>
                            <option value="1month">Last 30 Days</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="1year">Last 1 Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div className="w-full overflow-hidden" style={{ height: 300 }}>
                        {loading ? (
                            <Loader label="Loading revenue" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Recent Orders</h3>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Live
                        </span>
                    </div>
                    <div className="space-y-4">
                        {loading && <Loader label="Loading recent orders" />}
                        {!loading && recentOrders.length === 0 && (
                            <p className="text-sm text-slate-500">No recent orders found.</p>
                        )}
                        {recentOrders.map((order) => {
                            const customer = order.user?.name || 'Guest user';
                            const product = order.items?.[0]?.product?.name || order.items?.[0]?.productName || '—';
                            const initials = customer.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                            const amount = formatCurrency(order.pricing?.finalAmount || order.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0));
                            const status = order.status || 'pending';

                            const statusColor = status === 'delivered'
                                ? 'text-emerald-500'
                                : status === 'processing' || status === 'confirmed'
                                    ? 'text-blue-500'
                                    : status === 'pending'
                                        ? 'text-amber-500'
                                        : 'text-rose-500';

                            return (
                                <div key={order._id || order.id || order.orderNumber} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs text-slate-600">
                                            {initials || 'NA'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{customer}</p>
                                            <p className="text-xs text-slate-500">{product}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{amount}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
