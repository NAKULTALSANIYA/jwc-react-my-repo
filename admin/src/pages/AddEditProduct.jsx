import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Save } from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';

const fabricOptions = ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Net', 'Crepe', 'Velvet', 'Linen', 'Rayon', 'Polyester', 'Other'];
const occasionOptions = ['Wedding', 'Reception', 'Engagement', 'Mehendi', 'Sangeet', 'Party', 'Festival', 'Casual', 'Formal', 'Other'];
const genderOptions = ['Men', 'Women', 'Unisex'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Custom'];

const AddEditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        category: '',
        brand: '',
        fabric: 'Cotton',
        occasion: 'Casual',
        gender: 'Unisex',
        tags: [],
        careInstructions: '',
        weight: '',
        status: 'active',
        isActive: true,
        isFeatured: false,
        images: [],
        variants: [{
            size: 'M',
            color: '',
            sku: '',
            price: '',
            discountPercentage: 0,
            finalPrice: 0,
            stock: '',
            lowStockThreshold: 5,
            isActive: true
        }]
    });

    const [tagInput, setTagInput] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        loadCategories();
        if (isEdit) {
            loadProduct();
        }
    }, [id]);

    const loadCategories = async () => {
        try {
            const data = await adminApi.categories();
            setCategories(data?.categories || data || []);
        } catch (err) {
            // Handle error silently
        }
    };

    const loadProduct = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getProduct(id);
            const product = data?.product || data;
            
            setFormData({
                name: product.name || '',
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                category: product.category?._id || product.category || '',
                brand: product.brand || '',
                fabric: product.fabric || 'Cotton',
                occasion: product.occasion || 'Casual',
                gender: product.gender || 'Unisex',
                tags: product.tags || [],
                careInstructions: product.careInstructions || '',
                weight: product.weight || '',
                status: product.status || 'active',
                isActive: product.isActive !== false,
                isFeatured: product.isFeatured || false,
                images: product.images || [],
                variants: product.variants?.length > 0 ? product.variants.map(v => ({
                    ...v,
                    finalPrice: v.finalPrice || (v.price - (v.price * (v.discountPercentage || 0) / 100))
                })) : [{
                    size: 'M',
                    color: '',
                    sku: '',
                    price: '',
                    discountPercentage: 0,
                    finalPrice: 0,
                    stock: '',
                    lowStockThreshold: 5,
                    isActive: true
                }]
            });
        } catch (err) {
            setError(err.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, i) => {
                if (i !== index) return variant;
                
                const updatedVariant = { ...variant, [field]: value };
                
                // Auto-calculate finalPrice when price or discount changes
                if (field === 'price' || field === 'discountPercentage') {
                    const price = Number(field === 'price' ? value : variant.price) || 0;
                    const discount = Number(field === 'discountPercentage' ? value : variant.discountPercentage) || 0;
                    updatedVariant.finalPrice = price - (price * discount / 100);
                }
                
                return updatedVariant;
            })
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, {
                size: 'M',
                color: '',
                sku: '',
                price: '',
                finalPrice: 0,
                discountPercentage: 0,
                stock: '',
                lowStockThreshold: 5,
                isActive: true
            }]
        }));
    };

    const removeVariant = (index) => {
        if (formData.variants.length === 1) {
            alert('At least one variant is required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const addImage = () => {
        if (imageInput.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { url: imageInput.trim(), alt: formData.name, isPrimary: prev.images.length === 0 }]
            }));
            setImageInput('')
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImage(true);
        try {
            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert(`${file.name} is not an image file`);
                    continue;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} is too large. Max size is 5MB`);
                    continue;
                }

                // Upload to backend/cloudinary
                const response = await adminApi.uploadImage(file);
                
                // Add uploaded image URL to formData
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, { 
                        url: response.url || response.data?.url, 
                        alt: prev.name || 'Product Image', 
                        isPrimary: prev.images.length === 0 
                    }]
                }));
            }
        } catch (err) {
            alert(err.message || 'Failed to upload image. Please try again or use URL instead.');
        } finally {
            setUploadingImage(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            // Validate required fields
            if (!formData.name || !formData.description || !formData.category || !formData.fabric || !formData.occasion || !formData.gender) {
                throw new Error('Please fill all required fields');
            }

            if (formData.variants.length === 0) {
                throw new Error('At least one variant is required');
            }

            // Validate variants
            for (const variant of formData.variants) {
                if (!variant.color || !variant.sku || !variant.price || variant.stock === '') {
                    throw new Error('Please fill all variant fields (color, SKU, price, stock)');
                }
            }

            const payload = {
                ...formData,
                weight: formData.weight ? Number(formData.weight) : undefined,
                variants: formData.variants.map(v => {
                    const price = Number(v.price);
                    const discount = Number(v.discountPercentage) || 0;
                    // Use manually entered finalPrice if provided, otherwise calculate it
                    const finalPrice = v.finalPrice && Number(v.finalPrice) > 0 
                        ? Number(v.finalPrice)
                        : price - (price * discount / 100);
                    
                    return {
                        ...v,
                        price,
                        discountPercentage: discount,
                        stock: Number(v.stock),
                        lowStockThreshold: Number(v.lowStockThreshold) || 5,
                        finalPrice
                    };
                })
            };

            if (isEdit) {
                await adminApi.updateProduct(id, payload);
                alert('Product updated successfully!');
            } else {
                await adminApi.createProduct(payload);
                alert('Product created successfully!');
            }
            navigate('/products');
        } catch (err) {
            setError(err.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader label="Loading product..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/products')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                    <p className="text-slate-500">Fill in the details to {isEdit ? 'update' : 'create'} a product</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter product name"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter detailed product description"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Short Description
                            </label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Brief product summary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter brand name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Fabric <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="fabric"
                                value={formData.fabric}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {fabricOptions.map(fabric => (
                                    <option key={fabric} value={fabric}>{fabric}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Occasion <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="occasion"
                                value={formData.occasion}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {occasionOptions.map(occasion => (
                                    <option key={occasion} value={occasion}>{occasion}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {genderOptions.map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Weight (grams)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter weight"
                            />
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Product Variants</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            Add Variant
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-sm">Variant {index + 1}</h3>
                                    {formData.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Size <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={variant.size}
                                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            {sizeOptions.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Color <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={variant.color}
                                            onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Red"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            SKU <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={variant.sku}
                                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value.toUpperCase())}
                                            required
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., JWC-001-M-RED"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Price (₹) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                            required
                                            min="0"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={variant.discountPercentage}
                                            onChange={(e) => handleVariantChange(index, 'discountPercentage', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Final Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={variant.finalPrice || 0}
                                            onChange={(e) => handleVariantChange(index, 'finalPrice', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                            placeholder="Auto-calculated"
                                        />
                                    </div>
                                    {/* 
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Final Price (₹)
                                        </label>
                                        <input
                                            type="text"
                                            value={`₹${calculateFinalPrice(variant.price, variant.discountPercentage).toFixed(2)}`}
                                            readOnly
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
                                            placeholder="₹0.00"
                                        />
                                    </div>
                                    */}

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Stock <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                            required
                                            min="0"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">Product Images</h2>
                    <div className="space-y-3">
                        {/* URL Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Add Image by URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={imageInput}
                                    onChange={(e) => setImageInput(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter image URL"
                                />
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Upload size={18} />
                                </button>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Or Upload from Computer</label>
                            <div className="flex items-center gap-2">
                                <label className="flex-1 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Upload size={18} />
                                        <span className="text-sm">
                                            {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        disabled={uploadingImage}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Supports: JPG, PNG, GIF, WebP (Max 5MB each)</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image.url}
                                        alt={image.alt || 'Product'}
                                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                    {image.isPrimary && (
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                                            Primary
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">Additional Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter tag and press Enter"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-blue-900"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Care Instructions</label>
                            <textarea
                                name="careInstructions"
                                value={formData.careInstructions}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter care instructions"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="discontinued">Discontinued</option>
                            </select>
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium">Active</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium">Featured</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {isEdit ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditProduct;

