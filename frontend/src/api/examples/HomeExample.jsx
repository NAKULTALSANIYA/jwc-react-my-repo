/**
 * EXAMPLE: Home Page Integration with TanStack Query
 * 
 * This is an example showing how to connect the existing Home.jsx
 * to fetch real data from the backend API using TanStack Query.
 * 
 * COPY the relevant parts to your actual Home.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts, useCategories } from '../../hooks/useProducts';
import { ArrowRight, ArrowRightAlt } from 'lucide-react';

const HomeExample = () => {
    // Fetch featured products
    const { 
        data: featuredProducts, 
        isLoading: loadingProducts,
        error: productsError 
    } = useFeaturedProducts();

    // Fetch categories
    const { 
        data: categories, 
        isLoading: loadingCategories 
    } = useCategories();

    return (
        <>
            {/* Hero Section - Keep your existing hero */}
            <section className="relative w-full h-[600px] md:h-[700px] bg-background-dark overflow-hidden group">
                {/* Your existing hero content */}
            </section>

            {/* Trust Indicators - Keep as is */}
            <div className="bg-surface-dark py-8 border-y border-[#28392e]">
                {/* Your existing trust indicators */}
            </div>

            {/* Shop By Category - Now with REAL data */}
            <section className="py-16 md:py-24 px-4 md:px-10 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-white text-3xl md:text-4xl font-bold">
                        Curated <span className="text-secondary italic">Categories</span>
                    </h2>
                    <Link to="/collection" className="text-primary hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Loading State */}
                {loadingCategories && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-[3/4] bg-[#1a261e] rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Categories Grid - REAL DATA */}
                {!loadingCategories && categories && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {categories.slice(0, 3).map((category) => (
                            <Link 
                                key={category._id}
                                to={`/collection?category=${category._id}`} 
                                className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-xl cursor-pointer"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ 
                                        backgroundImage: `url('${category.image || category.imageUrl || 'https://via.placeholder.com/400'}')` 
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <h3 className="text-white text-2xl font-bold mb-2 font-display">
                                        {category.name}
                                    </h3>
                                    <p className="text-white/70 text-sm mb-4 font-body line-clamp-2">
                                        {category.description || 'Explore our collection'}
                                    </p>
                                    <span className="inline-flex items-center text-secondary text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Shop Now
                                        <ArrowRightAlt className="ml-1 text-lg" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Featured Products Section - REAL DATA */}
            <section className="py-16 md:py-24 px-4 md:px-10 max-w-7xl mx-auto w-full bg-background-dark">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-white text-3xl md:text-4xl font-bold">
                            Featured <span className="text-secondary italic">Collection</span>
                        </h2>
                        <p className="text-[#9db9a6] text-sm mt-2">Handpicked pieces for your special day</p>
                    </div>
                    <Link to="/collection" className="text-primary hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Loading State */}
                {loadingProducts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-[#1a261e] rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-[3/4] bg-[#28392c]" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-[#28392c] rounded w-3/4" />
                                    <div className="h-4 bg-[#28392c] rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {productsError && (
                    <div className="text-center py-12">
                        <p className="text-red-500">Failed to load products</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 text-primary hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Products Grid - REAL DATA */}
                {!loadingProducts && !productsError && featuredProducts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.slice(0, 8).map((product) => (
                            <Link 
                                key={product._id}
                                to={`/product/${product._id}`}
                                className="group bg-[#1a261e] rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(13,201,60,0.2)] transition-all duration-300"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#28392c]">
                                    <img
                                        src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    
                                    {/* Badge for new/featured */}
                                    {product.featured && (
                                        <div className="absolute top-4 left-4 bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-bold">
                                            FEATURED
                                        </div>
                                    )}
                                    
                                    {/* Quick View Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">Quick View</span>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="text-white font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-[#9db9a6] text-sm mb-2 line-clamp-2">
                                        {product.description || product.category?.name}
                                    </p>
                                    
                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-primary font-bold text-lg">
                                            ${product.price.toLocaleString()}
                                        </p>
                                        
                                        {/* Rating */}
                                        {product.rating && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-secondary text-sm">★</span>
                                                <span className="text-white text-sm">{product.rating}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock Status */}
                                    {product.stock !== undefined && (
                                        <p className={`text-xs mt-2 ${product.stock > 0 ? 'text-primary' : 'text-red-500'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loadingProducts && featuredProducts?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#9db9a6]">No featured products available</p>
                    </div>
                )}
            </section>

            {/* Keep your existing sections */}
            {/* Testimonials, Instagram Feed, etc. */}
        </>
    );
};

export default HomeExample;

/**
 * INTEGRATION STEPS:
 * 
 * 1. Copy the import statements at the top
 * 2. Add the hooks before your return statement
 * 3. Replace hardcoded product/category data with the fetched data
 * 4. Add loading states (optional but recommended)
 * 5. Add error handling (optional but recommended)
 * 
 * MINIMAL INTEGRATION (Quick Start):
 * 
 * import { useFeaturedProducts } from '../hooks/useProducts';
 * 
 * const { data: featuredProducts } = useFeaturedProducts();
 * 
 * // Use featuredProducts?.map() in your JSX
 * {featuredProducts?.map(product => (
 *   <ProductCard key={product._id} product={product} />
 * ))}
 */
