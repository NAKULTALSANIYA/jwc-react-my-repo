import React, { useEffect, useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    MoreVertical,
    Search,
    Filter
} from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';
import { SkeletonCustomerCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';

const formatCurrency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
})}`;

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { error: showError } = useToast();

    useEffect(() => {
        let active = true;

        const loadCustomers = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await adminApi.customers({ role: 'customer', limit: 18 });
                if (!active) return;
                setCustomers(data?.users || data || []);
            } catch (err) {
                if (active) {
                    const errorMessage = err.message || 'Unable to load customers';
                    setError(errorMessage);
                    // Show toast after state update
                    setTimeout(() => showError(errorMessage), 0);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCustomers();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = (customer.name || customer.fullName || '').toLowerCase();
        const email = (customer.email || '').toLowerCase();
        const phone = (customer.phone || customer.mobile || '').toLowerCase();

        const matchesSearch = searchLower === '' ||
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower);

        if (!matchesSearch) return false;

        if (statusFilter !== 'all') {
            const customerStatus = customer.isActive === false ? 'inactive' : 'active';
            if (customerStatus !== statusFilter) return false;
        }

        return true;
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Customers</h1>
                <p className="text-slate-500">View and manage your customer database.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 w-80">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <Filter size={16} />
                            Filter
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-40 hidden group-hover:block">
                            <button 
                                onClick={() => setStatusFilter('all')}
                                className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                                All Customers
                            </button>
                            <button 
                                onClick={() => setStatusFilter('active')}
                                className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'active' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                                Active
                            </button>
                            <button 
                                onClick={() => setStatusFilter('inactive')}
                                className={`block w-full text-left px-4 py-2 text-sm border-t border-slate-100 ${statusFilter === 'inactive' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {loading && (
                        <>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonCustomerCard key={i} />
                            ))}
                        </>
                    )}
                    {error && !loading && <p className="text-sm text-rose-600">{error}</p>}
                    {!loading && !error && customers.length === 0 && <p className="text-sm text-slate-500">No customers found.</p>}
                    {!loading && !error && filteredCustomers.map((customer) => {
                        const fullName = customer.name || customer.fullName || 'Unknown';
                        const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                        const status = customer.isActive === false ? 'Inactive' : 'Active';
                        const orders = customer.metrics?.totalOrders || customer.orderCount || 0;
                        const spent = customer.metrics?.totalSpent || customer.totalSpent || 0;
                        const primaryAddress = customer.addresses?.[0];
                        const location = primaryAddress ? `${primaryAddress.city || ''} ${primaryAddress.country || ''}`.trim() || '—' : '—';

                        return (
                            <div key={customer._id || customer.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow relative group">
                                <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                                    <MoreVertical size={18} />
                                </button>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                                        {initials || 'CU'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{fullName}</h3>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {status}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail size={16} className="text-slate-400" />
                                        {customer.email || 'No email'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone size={16} className="text-slate-400" />
                                        {customer.phone || customer.mobile || 'No phone'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MapPin size={16} className="text-slate-400" />
                                        {location}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase">Total Orders</p>
                                        <p className="font-bold">{orders}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-medium uppercase">Total Spent</p>
                                        <p className="font-bold text-blue-600">{formatCurrency(spent)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Customers;
