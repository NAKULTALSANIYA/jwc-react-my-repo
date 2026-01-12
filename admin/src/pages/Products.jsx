import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';

const formatCurrency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
})}`;

const derivePrice = (product) => {
    const variantPrice = product.variants?.[0]?.finalPrice ?? product.variants?.[0]?.price;
    return variantPrice ?? product.price ?? product.basePrice ?? 0;
};

const deriveStock = (product) => {
    if (product.inventory?.totalStock !== undefined) return product.inventory.totalStock;
    if (Array.isArray(product.variants)) {
        return product.variants.reduce((sum, variant) => sum + (variant.stock || variant.quantity || 0), 0);
    }
    return product.stock ?? product.totalStock ?? 0;
};

const getStatus = (product) => {
    const stock = deriveStock(product);
    if (stock <= 0) return 'Out of Stock';
    if (stock < 5) return 'Low Stock';
    if (product.isActive === false) return 'Inactive';
    return 'In Stock';
};

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminApi.products({ limit: 50, sort: 'createdAt', order: 'desc' });
            setProducts(data?.products || data || []);
        } catch (err) {
            setError(err.message || 'Unable to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        
        setDeleting(true);
        try {
            await adminApi.deleteProduct(deleteConfirm._id || deleteConfirm.id);
            setProducts(prev => prev.filter(p => (p._id || p.id) !== (deleteConfirm._id || deleteConfirm.id)));
            setDeleteConfirm(null);
        } catch (err) {
            alert(err.message || 'Failed to delete product');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-slate-500">Manage your store products, stock and pricing.</p>
                </div>
                <button 
                    onClick={() => navigate('/products/add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 w-80">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold">Stock</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && (
                                <tr>
                                    <td className="px-6 py-4" colSpan={6}>
                                        <Loader label="Loading products" />
                                    </td>
                                </tr>
                            )}
                            {error && !loading && (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-rose-600" colSpan={6}>{error}</td>
                                </tr>
                            )}
                            {!loading && !error && products.length === 0 && (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-500" colSpan={6}>No products found.</td>
                                </tr>
                            )}
                            {products.map((product) => {
                                const stock = deriveStock(product);
                                const status = getStatus(product);
                                const price = derivePrice(product);
                                const productId = product._id || product.id;
                                const image = product.images?.[0]?.url || product.images?.[0] || product.thumbnail;
                                const categoryName = product.category?.name || product.category?.title || product.category || '—';

                                return (
                                    <tr key={productId} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={image || 'https://placehold.co/80x80?text=JWC'}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                                                />
                                                <div>
                                                    <p className="font-bold text-sm">{product.name}</p>
                                                    <p className="text-xs text-slate-500">#{(productId || '').toString().slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                                                {categoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{formatCurrency(price)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{stock} items</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status === 'In Stock' ? 'bg-emerald-100 text-emerald-600' :
                                                    status === 'Low Stock' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-rose-100 text-rose-600'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigate(`/products/edit/${productId}`)}
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteConfirm(product)}
                                                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <p>Showing {products.length ? 1 : 0} to {products.length} of {products.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Delete Product</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? 
                            This will permanently remove the product and all its variants from your store.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Product'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;