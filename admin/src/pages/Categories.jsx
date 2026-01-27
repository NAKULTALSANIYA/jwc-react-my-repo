import React, { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    AlertTriangle,
    X
} from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';
import { SkeletonTableRow } from '../components/Skeleton';
import { useToast } from '../components/Toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { success: showSuccess, error: showError } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        imageUrl: '',
        seoTitle: '',
        seoDescription: '',
        isActive: true,
        displayOnHome: false,
        displaySection: 'none',
        sequence: 0
    });

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminApi.categories();
            const categoryList = data?.categories || data || [];
            setCategories(Array.isArray(categoryList) ? categoryList : []);
        } catch (err) {
            setError(err.message || 'Failed to load categories');
            showError(err.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Map seoTitle/seoDescription to metaTitle/metaDescription for backend
            const categoryData = {
                ...formData,
                metaTitle: formData.seoTitle,
                metaDescription: formData.seoDescription
            };
            // Remove the seo fields as backend doesn't expect them
            delete categoryData.seoTitle;
            delete categoryData.seoDescription;

            if (editingId) {
                await adminApi.updateCategory(editingId, categoryData);
                showSuccess('Category updated successfully');
            } else {
                await adminApi.createCategory(categoryData);
                showSuccess('Category created successfully');
            }
            
            setShowModal(false);
            resetForm();
            await loadCategories();
        } catch (err) {
            showError(err.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            image: category.image || '',
            imageUrl: category.imageUrl || '',
            seoTitle: category.metaTitle || '',
            seoDescription: category.metaDescription || '',
            isActive: category.isActive !== false,
            displayOnHome: category.displayOnHome || false,
            displaySection: category.displaySection || 'none',
            sequence: category.sequence || 0
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        
        setDeleting(true);
        try {
            await adminApi.deleteCategory(deleteConfirm._id);
            showSuccess('Category deleted successfully');
            setDeleteConfirm(null);
            await loadCategories();
        } catch (err) {
            showError(err.message || 'Failed to delete category');
        } finally {
            setDeleting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: '',
            imageUrl: '',
            seoTitle: '',
            seoDescription: '',
            isActive: true,
            displayOnHome: false,
            displaySection: 'none',
            sequence: 0
        });
        setEditingId(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
                    <p className="text-slate-600 mt-1">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Category
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-gap-3 text-rose-800">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Categories Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Description</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        {categories.length === 0 ? 'No categories yet' : 'No matching categories found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {category.image && (
                                                    <img 
                                                        src={category.image} 
                                                        alt={category.name}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <span className="font-medium text-slate-900">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {category.description ? category.description.substring(0, 50) + '...' : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                category.isActive 
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 justify-end">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm"
                                                    title="Edit category"
                                                >
                                                    <Pencil size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(category)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm"
                                                    title="Delete category"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <p>Showing {filteredCategories.length} of {categories.length} categories</p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                                <AlertTriangle size={24} className="text-rose-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Delete Category?</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingId ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., Women's Sarees"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Category description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Image URL (Alternative)
                                </label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Sequence Order
                                    </label>
                                    <input
                                        type="number"
                                        name="sequence"
                                        value={formData.sequence}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Lower numbers appear first on home page</p>
                                </div>

                                <div className="flex flex-col justify-end gap-2">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="displayOnHome"
                                            checked={formData.displayOnHome}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Display on Home Page</span>
                                    </label>
                                    <p className="text-xs text-slate-500">Show this occasion in the "Shop by Occasion" section</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Display Section
                                    </label>
                                    <select
                                        name="displaySection"
                                        value={formData.displaySection}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="none">None (Don't Display)</option>
                                        <option value="occasion">Shop by Occasion</option>
                                        <option value="women">Shop Women</option>
                                        <option value="accessories">Shop Accessories</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Choose which home page section to display this category</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-slate-300"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                    Active Category
                                </label>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingId ? 'Update Category' : 'Create Category'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
