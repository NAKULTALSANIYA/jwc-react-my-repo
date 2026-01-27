import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { getProducts } from '../api/services/product.service';
import { useToggleWishlist, useWishlist } from '../hooks/useExtras';
import { tokenManager } from '../api/axios';
import { Check, ChevronDown, Heart, X } from 'lucide-react';

const Skeleton = ({ className }) => (
    <div className={clsx('bg-[#1f2a22] rounded-md animate-pulse', className)} />
);

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const categoryFromUrl = searchParams.get('category');
    
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState(50000);
    const [maxPrice, setMaxPrice] = useState(50000);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [sortBy, setSortBy] = useState("Recommended");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableCategoryIds, setAvailableCategoryIds] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [animatingHearts, setAnimatingHearts] = useState({});

    const { toggleWishlist, isLoading: wishlistBusy } = useToggleWishlist();
    const { data: wishlistData } = useWishlist();
    
    // Check if user is authenticated
    const isAuthenticated = !!tokenManager.getAccessToken();

    const isInWishlist = useCallback((productId, variantId) => {
        const items = wishlistData?.items || [];
        return items.some((entry) => {
            const matchProduct = entry?.product?._id === productId || entry?._id === productId;
            const matchVariant = entry?.variantId === variantId || (!entry?.variantId && !variantId);
            return matchProduct && matchVariant;
        });
    }, [wishlistData]);

    const normalizeProduct = (product) => {
        const variants = product?.variants || [];
        const activeVariant = variants.find(v => v.isActive) || variants[0] || {};
        const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
        const colors = [...new Set(variants.map(v => v.color?.toLowerCase()).filter(Boolean))];

        const primaryImage =
            activeVariant.images?.find(img => img?.isPrimary)?.url ||
            product?.images?.find(img => img?.isPrimary)?.url ||
            activeVariant.images?.[0]?.url ||
            product?.images?.[0]?.url ||
            '';

        const hasDiscount = (activeVariant.discountPercentage || 0) > 0;
        const price = activeVariant.finalPrice ?? activeVariant.price ?? 0;
        const originalPrice = hasDiscount ? activeVariant.price : null;
        const discount = hasDiscount ? `${Math.round(activeVariant.discountPercentage)}% Off` : null;

        return {
            id: product?.slug || product?._id,
            productId: product?._id,
            slug: product?.slug,
            name: product?.name || 'Product',
            price,
            originalPrice,
            category: product?.category?.name || 'Product',
            categoryId: product?.category?._id || null,
            colors,
            sizes,
            variantId: activeVariant?._id,
            image: primaryImage,
            description: product?.shortDescription || product?.description || '',
            discount,
        };
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getProducts({ isActive: true, status: 'active', limit: 100 });
            const apiProducts = response?.data?.products || response?.products || response?.data?.data?.products || [];
            const normalized = apiProducts.map(normalizeProduct);

            setProducts(normalized);
            
            // Apply category filter immediately if URL parameter exists
            let initialFiltered = normalized;
            if (categoryFromUrl) {
                initialFiltered = normalized.filter(product => product.categoryId === categoryFromUrl);
                const matchingCategory = normalized.find(p => p.categoryId === categoryFromUrl);
                if (matchingCategory) {
                    setSelectedCategories([matchingCategory.category]);
                }
            }
            setFilteredProducts(initialFiltered);

            const categories = [...new Set(normalized.map(p => p.category).filter(Boolean))];
            const categoryIds = [...new Set(normalized.map(p => ({ id: p.categoryId, name: p.category })).filter(c => c.id))];
            const colors = [...new Set(normalized.flatMap(p => p.colors || []))];
            const sizes = [...new Set(normalized.flatMap(p => p.sizes || []))];

            setAvailableCategories(categories);
            setAvailableCategoryIds(categoryIds);
            setAvailableColors(colors);
            setAvailableSizes(sizes);

            const highestPrice = normalized.reduce((max, item) => Math.max(max, item.price || 0), 0);
            const effectiveMax = Math.max(highestPrice || 0, 50000);
            setMaxPrice(effectiveMax);
            setPriceRange(effectiveMax);

            setError('');
        } catch {
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [categoryFromUrl]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openQuickView = (product) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    const closeQuickView = () => {
        setIsQuickViewOpen(false);
        setQuickViewProduct(null);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeQuickView();
            }
        };
        if (isQuickViewOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isQuickViewOpen]);

    // Filter Logic
    useEffect(() => {
        let result = [...products];

        // Filter by URL category parameter if present
        if (categoryFromUrl) {
            result = result.filter(product => product.categoryId === categoryFromUrl);
        } else if (selectedCategories.length > 0) {
            result = result.filter(product => selectedCategories.includes(product.category));
        }

        result = result.filter(product => (product.price || 0) <= priceRange);

        if (selectedColors.length > 0) {
            result = result.filter(product => (product.colors || []).some(color => selectedColors.includes(color)));
        }

        if (selectedSizes.length > 0) {
            result = result.filter(product => (product.sizes || []).some(size => selectedSizes.includes(size)));
        }

        if (sortBy === "Price: Low to High") {
            result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "Price: High to Low") {
            result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        setFilteredProducts(result);
    }, [products, priceRange, selectedCategories, selectedColors, selectedSizes, sortBy, categoryFromUrl]);

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const toggleColor = (color) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    const toggleSize = (size) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setPriceRange(maxPrice);
        setSortBy("Recommended");
        // Clear URL parameters to remove category filter
        navigate('/products', { replace: true });
    };

    const categoryOptions = availableCategories.length ? availableCategories : ["Sherwani", "Indo-Western", "Kurta Sets"];
    const colorOptions = availableColors.length ? availableColors : ["red", "gold", "green", "blue", "black", "white"];
    const sizeOptions = availableSizes.length ? availableSizes : ["S", "M", "L", "XL", "2XL"];

    if (loading) {
        const skeletonCards = Array.from({ length: 9 });

        return (
            <div className="flex flex-col min-h-screen">
                <div className="relative w-full h-55 md:h-75 bg-background-dark overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-[#1f2a22] via-[#243128] to-[#1f2a22] opacity-60 animate-pulse" />
                    <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/60 to-transparent" />
                    <div className="relative h-full max-w-360 mx-auto px-6 md:px-10 flex flex-col justify-end pb-8">
                        <Skeleton className="h-3 w-32 mb-3 bg-[#2d3b30]" />
                        <Skeleton className="h-8 w-64 bg-[#2d3b30]" />
                    </div>
                </div>

                <div className="flex-1 w-full max-w-360 mx-auto flex flex-col lg:flex-row gap-8 px-4 md:px-10 py-8">
                    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
                        <div className="bg-surface-dark rounded-xl p-5 border border-[#28392e]">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-5 w-20 bg-[#2d3b30]" />
                                <Skeleton className="h-4 w-12 bg-[#2d3b30]" />
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3].map((section) => (
                                    <div key={section} className="space-y-3">
                                        <Skeleton className="h-4 w-24 bg-[#2d3b30]" />
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map((item) => (
                                                <div key={item} className="flex items-center gap-3">
                                                    <Skeleton className="h-4 w-4 bg-[#2d3b30]" />
                                                    <Skeleton className="h-3 w-24 bg-[#2d3b30]" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <Skeleton className="h-4 w-32 bg-[#2d3b30]" />
                            <Skeleton className="h-10 w-40 bg-[#2d3b30]" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                            {skeletonCards.map((_, idx) => (
                                <div key={idx} className="bg-surface-dark rounded-lg overflow-hidden border border-[#28392e]">
                                    <Skeleton className="w-full aspect-3/4 bg-[#2d3b30]" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-4 w-3/4 bg-[#2d3b30]" />
                                        <Skeleton className="h-3 w-full bg-[#2d3b30]" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-5 w-16 bg-[#2d3b30]" />
                                            <Skeleton className="h-4 w-12 bg-[#2d3b30]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
                <h1 className="text-3xl font-bold mb-3">Unable to load products</h1>
                <p className="text-[#9db9a6] mb-6 text-center max-w-md">{error}</p>
                <button
                    onClick={fetchProducts}
                    className="bg-primary text-black px-6 py-3 rounded font-semibold hover:opacity-90 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Header Image */}
            <div className="relative w-full h-55 md:h-75 bg-background-dark overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwfvA_i4rdmi55FTzbFeuZP-uUuTs3dM646mxlg3NSJZgK1fCLA_ZR2nQ9accXVhLXlS5JEiu0HIWTXX1x_3XE2Y_GfFJfETcLaRTESV04WcUALK1_y_bLMytK7yc9w51JYWk3zVbTcgiX1lucfDmPfYXrhQqvIFbpPI18YnJL-jk0onNWl8qUzwpe4vNF3Akd77HN3Rmt8zoorUHQ9zDxAsPMLq52o6USXYxW57VFrtwR4V7ZXT4IESdehBXo-JYTqASoPysQ-5SC')", opacity: 0.6 }}
                ></div>
                <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/50 to-transparent"></div>
                <div className="relative h-full max-w-360 mx-auto px-6 md:px-10 flex flex-col justify-end pb-8 animate-fade-in-up">
                    <p className="text-secondary uppercase tracking-widest text-xs font-sans font-bold mb-2">Heritage Collection</p>
                    <h1 className="text-white text-3xl md:text-5xl font-bold font-display">Exclusive Ethnic Wear</h1>
                </div>
            </div>

            <div className="flex-1 w-full max-w-360 mx-auto flex flex-col lg:flex-row gap-8 px-4 md:px-10 py-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
                    <div className="bg-surface-dark rounded-xl p-5 border border-[#28392e]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white text-xl font-bold">Filters</h2>
                            <button
                                onClick={resetFilters}
                                className="text-xs text-[#9db9a6] hover:text-secondary font-sans underline"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            {/* Categories */}
                            <div className="py-3 border-b border-[#28392e]">
                                <h3 className="text-white font-medium mb-3">Category</h3>
                                <div className="flex flex-col gap-2">
                                    {categoryOptions.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer group/item">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                    className="peer size-4 appearance-none rounded border border-[#9db9a6] bg-transparent checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0"
                                                />
                                                <Check className="absolute inset-0 text-black w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-[#9db9a6] text-sm group-hover/item:text-white transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="py-3 border-b border-[#28392e]">
                                <h3 className="text-white font-medium mb-3">Price Range</h3>
                                <div className="pt-2 pb-1">
                                    <input
                                        type="range"
                                        min="1000"
                                        max={maxPrice}
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="w-full h-1 bg-[#28392e] rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-[#9db9a6] font-sans">
                                        <span>₹1,000</span>
                                        <span>Max: ₹{priceRange.toLocaleString()}</span>
                                        <span>₹{maxPrice.toLocaleString()}+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Size */}
                            <div className="py-3 border-b border-[#28392e]">
                                <h3 className="text-white font-medium mb-3">Size</h3>
                                <div className="flex flex-wrap gap-2">
                                    {sizeOptions.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => toggleSize(size)}
                                            className={clsx(
                                                "size-9 rounded-full text-sm font-sans transition-all",
                                                selectedSizes.includes(size)
                                                    ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(17,212,82,0.3)]"
                                                    : "border border-[#28392e] text-[#9db9a6] hover:border-secondary hover:text-secondary"
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div className="py-3">
                                <h3 className="text-white font-medium mb-3">Color</h3>
                                <div className="flex flex-wrap gap-3">
                                    {colorOptions.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => toggleColor(color)}
                                            className={clsx(
                                                "size-6 rounded-full ring-2 transition-all border border-[#28392e]",
                                                selectedColors.includes(color) ? "ring-white scale-110" : "ring-transparent hover:ring-white/50"
                                            )}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid Area */}
                <main className="flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <p className="text-[#9db9a6] text-sm"><span className="text-white font-bold">{filteredProducts.length}</span> Products found</p>
                        <div className="flex items-center gap-3">
                            <span className="text-[#9db9a6] text-sm hidden sm:block">Sort by:</span>
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-surface-dark border border-[#28392e] text-white text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-secondary cursor-pointer font-sans min-w-40"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option>Recommended</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>New Arrivals</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9db9a6] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                            {filteredProducts.map(product => {
                                const productId = product.productId || product.id || product.slug;
                                const variantId = product.variantId;
                                const wishlisted = isInWishlist(productId, variantId);

                                return (
                                <Link
                                    key={productId}
                                    to={`/product/${product.slug || product.productId || product.id}`}
                                    className="group bg-surface-dark rounded-lg overflow-hidden border border-[#28392e] hover:border-secondary/50 hover:shadow-xl transition-all duration-300 flex flex-col relative"
                                >
                                    <div className="relative w-full aspect-3/4 overflow-hidden bg-gray-900">
                                        {product.image ? (
                                            <img 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                src={product.image} 
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/400x600/1a261e/0dc93c?text=' + encodeURIComponent(product.name || 'Product');
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/30">
                                                <span className="text-sm">No Image</span>
                                            </div>
                                        )}
                                        {product.discount && (
                                            <div className={clsx(
                                                "absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                                                product.discount === "New" ? "bg-secondary text-black" : "bg-red-600 text-white"
                                            )}>
                                                {product.discount}
                                            </div>
                                        )}
                                        {isAuthenticated && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setAnimatingHearts(prev => ({ ...prev, [productId]: true }));
                                                    toggleWishlist(productId, variantId);
                                                    setTimeout(() => {
                                                        setAnimatingHearts(prev => ({ ...prev, [productId]: false }));
                                                    }, 600);
                                                }}
                                                className={clsx(
                                                    "absolute top-3 right-3 size-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors border",
                                                    animatingHearts[productId] && "heart-animate",
                                                    wishlisted
                                                        ? "bg-primary text-black border-primary"
                                                        : "bg-black/40 text-white hover:bg-primary hover:text-black border-transparent"
                                                )}
                                                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                                disabled={wishlistBusy || !variantId}
                                            >
                                                <Heart className={clsx("w-4 h-4", wishlisted && "fill-current")} />
                                            </button>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center bg-linear-to-t from-black/80 to-transparent pt-10">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    openQuickView(product);
                                                }}
                                                className="bg-white text-black font-medium text-xs md:text-sm px-4 md:px-6 py-2 rounded shadow-lg hover:bg-primary transition-colors w-full"
                                            >
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 md:p-4 flex flex-col gap-1 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-white font-display text-sm md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                                        </div>
                                        <p className="text-[#9db9a6] text-xs line-clamp-1 mb-2">{product.description}</p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-secondary font-bold text-base md:text-lg">₹{(product.price || 0).toLocaleString()}</span>
                                                {product.originalPrice && (
                                                    <span className="text-gray-500 text-xs line-through decoration-gray-500">₹{product.originalPrice.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                );
                                })}
                            </div>
                    ) : (
                        <div className="text-center py-20 text-white/50">
                            <p className="text-xl">No products match your filters.</p>
                            <button
                                onClick={resetFilters}
                                className="mt-4 text-primary hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
            {isQuickViewOpen && quickViewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={closeQuickView}></div>
                    <div className="relative bg-surface-dark border border-[#28392e] rounded-xl shadow-2xl max-w-3xl md:max-w-4xl w-full overflow-hidden">
                        <button
                            onClick={closeQuickView}
                            className="absolute top-2 right-2 text-[#9db9a6] hover:text-white size-8 rounded flex items-center justify-center"
                            aria-label="Close quick view"
                        >
                            <X />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="bg-black">
                                {quickViewProduct.image ? (
                                    <img
                                        src={quickViewProduct.image}
                                        alt={quickViewProduct.name}
                                        className="w-full h-80 md:h-96 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-80 md:h-96 flex items-center justify-center text-white/30">
                                        <span className="text-lg">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 md:p-8 flex flex-col gap-4">
                                <h3 className="text-white font-display text-2xl leading-tight">{quickViewProduct.name}</h3>
                                <p className="text-[#9db9a6] text-sm line-clamp-3">{quickViewProduct.description}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-secondary font-bold text-3xl">₹{(quickViewProduct.price || 0).toLocaleString()}</span>
                                    {quickViewProduct.originalPrice && (
                                        <span className="text-gray-500 line-through">₹{quickViewProduct.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                                {Array.isArray(quickViewProduct.sizes) && quickViewProduct.sizes.length > 0 && (
                                    <div>
                                        <span className="text-white text-sm">Sizes</span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {quickViewProduct.sizes.slice(0, 6).map((size) => (
                                                <span key={size} className="px-2 py-1 border border-[#28392e] rounded text-[#9db9a6] text-xs">
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Array.isArray(quickViewProduct.colors) && quickViewProduct.colors.length > 0 && (
                                    <div>
                                        <span className="text-white text-sm">Colors</span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {quickViewProduct.colors.slice(0, 6).map((color) => (
                                                <span
                                                    key={color}
                                                    className="size-6 rounded-full border border-[#28392e]"
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                ></span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 flex gap-3">
                                    <Link
                                        to={`/product/${quickViewProduct.slug || quickViewProduct.productId || quickViewProduct.id}`}
                                        className="flex-1 bg-primary text-black font-semibold px-4 py-2 rounded hover:opacity-90 text-center"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        onClick={closeQuickView}
                                        className="px-4 py-2 rounded border border-[#28392e] text-[#9db9a6] hover:text-white hover:border-secondary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;