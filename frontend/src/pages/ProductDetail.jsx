import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductBySlug } from '../api/services/product.service';
import { useAddToCart } from '../hooks/useCart';
import { useToggleWishlist, useWishlist } from '../hooks/useExtras';
import { tokenManager } from '../api/axios';
import { Minus, Plus, ShoppingCart, Heart, CheckCircle, XCircle, Truck, ShieldCheck, RefreshCw, HourglassIcon } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const addToCartMutation = useAddToCart();
    const { toggleWishlist, isLoading: wishlistBusy } = useToggleWishlist();
    const { data: wishlistData } = useWishlist();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Simple check for MongoDB ObjectId
    const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

    // Legacy numeric ids (1-6) mapped to seeded slugs for backward compatibility
    const legacySlugMap = {
        '1': 'royal-gold-silk-sherwani',
        '2': 'emerald-velvet-indo-western',
        '3': 'ivory-cotton-silk-kurta',
        '4': 'maroon-jodhpuri-set',
        '5': 'navy-blue-bandhgala',
        '6': 'golden-jacquard-jacket',
    };

    // Fetch product data (supports both ObjectId and slug)
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const resolvedId = legacySlugMap[id] || id; // translate numeric placeholders to real slugs

                const response = isObjectId(resolvedId)
                    ? await getProductById(resolvedId)
                    : await getProductBySlug(resolvedId);

                // API responses are wrapped: { success, message, data: { product } }
                const apiProduct = response?.data?.product || response?.data?.data?.product || response?.product;
                setProduct(apiProduct || null);
                setError(apiProduct ? null : 'Product not found');
            } catch (err) {
                const apiMessage = err?.response?.data?.message;
                setError(apiMessage || 'Failed to load product. Please try again.');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Update selected variant when size or color changes
    useEffect(() => {
        if (product && selectedSize && selectedColor) {
            const variant = product.variants.find(
                v => v.size === selectedSize && v.color === selectedColor
            );
            setSelectedVariant(variant);
            if (variant && variant.images && variant.images.length > 0) {
                setSelectedImage(0);
            }
        }
    }, [selectedSize, selectedColor, product]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                <h1 className="text-3xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <p className="text-[#9db9a6] mb-6">{error || 'The product you are looking for does not exist.'}</p>
                <Link to="/" className="text-primary hover:underline">Back to Home</Link>
            </div>
        );
    }

    // Get unique sizes and colors from variants
    const uniqueSizes = [...new Set(product.variants.map(v => v.size))];
    const uniqueColors = [...new Set(product.variants.map(v => v.color))];
    const mainImages = (selectedVariant?.images && selectedVariant.images.length > 0 && selectedVariant.images.some(img => img?.url))
        ? selectedVariant.images 
        : (product.images && product.images.length > 0 ? product.images : []);

    // Get price information based on selection
    const getPriceInfo = () => {
        if (selectedVariant) {
            // Full variant selected (size + color)
            return {
                finalPrice: selectedVariant.finalPrice,
                originalPrice: selectedVariant.price,
                discountPercentage: selectedVariant.discountPercentage,
            };
        } else if (selectedSize) {
            // Only size selected, get price range for that size
            const variantsForSize = product.variants.filter(v => v.size === selectedSize);
            const prices = variantsForSize.map(v => v.finalPrice);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            return {
                finalPrice: minPrice,
                maxPrice: minPrice !== maxPrice ? maxPrice : null,
                isRange: minPrice !== maxPrice,
            };
        } else {
            // No selection, show base price or range
            const prices = product.variants.map(v => v.finalPrice);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            return {
                finalPrice: minPrice,
                maxPrice: minPrice !== maxPrice ? maxPrice : null,
                isRange: minPrice !== maxPrice,
            };
        }
    };

    const priceInfo = getPriceInfo();

    const wishlistItems = wishlistData?.items || [];
    const currentVariantId = selectedVariant?._id || product?.variants?.[0]?._id;
    const isWishlisted = wishlistItems.some(
        (item) =>
            (item?.product?._id === product._id || item?._id === product._id) &&
            item?.variantId === currentVariantId
    );

    // Check if user is authenticated
    const isAuthenticated = !!tokenManager.getAccessToken();

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            alert('Please select both size and color');
            return;
        }

        try {
            await addToCartMutation.mutateAsync({
                productId: product._id,
                variantId: selectedVariant._id,
                quantity,
                size: selectedSize,
                color: selectedColor,
                price: selectedVariant.finalPrice,
                // Pass full product data for guest cart
                productData: {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    images: product.images,
                    category: product.category,
                    variants: product.variants
                }
            });
            
            // Show success message
            alert(`${quantity} item(s) added to cart!`);
            
            // Reset form
            setQuantity(1);
            setSelectedSize('');
            setSelectedColor('');
            setSelectedVariant(null);
            
            // Navigate to cart for checkout
            setTimeout(() => {
                navigate('/cart');
            }, 500);
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to add to cart. Please try again.');
            console.error('Error adding to cart:', error);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <Link to="/" className="text-[#9db9a6] hover:text-primary transition-colors">Home</Link>
                <span className="text-[#9db9a6]/50">/</span>
                <Link to="/products" className="text-[#9db9a6] hover:text-primary transition-colors">Products</Link>
                <span className="text-[#9db9a6]/50">/</span>
                <span className="text-secondary font-medium">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Product Images */}
                <div className="flex flex-col gap-4">
                    {/* Main Image */}
                    <div className="relative w-full rounded-xl overflow-hidden bg-surface-dark border border-[#28392e] min-h-[320px] aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]">
                        {mainImages[selectedImage]?.url ? (
                            <img
                                src={mainImages[selectedImage].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                                <span className="text-lg">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {mainImages && mainImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                            {mainImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-secondary'
                                            : 'border-[#28392e] hover:border-[#9db9a6]'
                                        }`}
                                >
                                    {image?.url ? (
                                        <img
                                            src={image.url}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#111813] text-white/20 text-xs">
                                            No Img
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="text-[#9db9a6] text-sm mb-2">{product.category?.name || 'Product'}</p>
                        <h1 className="text-white text-3xl md:text-4xl font-bold font-display mb-3">{product.name}</h1>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-secondary text-3xl font-black">
                                ₹{priceInfo.finalPrice.toLocaleString()}
                                {priceInfo.isRange && priceInfo.maxPrice && (
                                    <> - ₹{priceInfo.maxPrice.toLocaleString()}</>
                                )}
                            </span>
                            {priceInfo.originalPrice && priceInfo.discountPercentage > 0 && (
                                <>
                                    <span className="text-gray-500 text-xl line-through">₹{priceInfo.originalPrice.toLocaleString()}</span>
                                    <span className="text-red-500 text-sm font-bold">{Math.round(priceInfo.discountPercentage)}% OFF</span>
                                </>
                            )}
                        </div>
                        {priceInfo.isRange && (
                            <p className="text-[#9db9a6] text-sm mb-3">
                                {selectedSize ? `Price varies by color for size ${selectedSize}` : 'Price varies by size and color'}
                            </p>
                        )}
                        <p className="text-[#9db9a6] text-base leading-relaxed">{product.description}</p>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="text-white font-medium mb-3 block">Select Color</label>
                        <div className="flex flex-wrap gap-3">
                            {uniqueColors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all ${selectedColor === color
                                            ? 'bg-primary text-black shadow-[0_0_10px_rgba(17,212,82,0.3)]'
                                            : 'border border-[#28392e] text-white hover:border-secondary'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div>
                        <label className="text-white font-medium mb-3 block">Select Size</label>
                        <div className="flex flex-wrap gap-3">
                            {uniqueSizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all ${selectedSize === size
                                            ? 'bg-primary text-black shadow-[0_0_10px_rgba(17,212,82,0.3)]'
                                            : 'border border-[#28392e] text-white hover:border-secondary'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="text-white font-medium mb-3 block">Quantity</label>
                        <div className="flex items-center border border-[#28392e] rounded-lg bg-surface-dark w-fit">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-3 text-white hover:text-primary transition-colors"
                            >
                                <Minus />
                            </button>
                            <span className="px-6 text-white font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-3 text-white hover:text-primary transition-colors"
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={addToCartMutation.isPending || !selectedVariant}
                            className={`flex-1 px-8 py-4 rounded-lg font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                                addToCartMutation.isPending || !selectedVariant
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-white hover:text-background-dark text-background-dark shadow-[0_0_20px_rgba(17,212,82,0.3)]'
                            }`}
                        >
                            {addToCartMutation.isPending ? <HourglassIcon /> : <ShoppingCart />}
                            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                        </button>
                        {isAuthenticated && (
                            <button
                                onClick={() => toggleWishlist(product._id, currentVariantId)}
                                disabled={wishlistBusy || !currentVariantId}
                                className={`border-2 px-8 py-4 rounded-lg font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                                    isWishlisted
                                        ? 'bg-secondary text-black border-secondary'
                                        : 'border-secondary hover:bg-secondary hover:text-black text-secondary'
                                } ${wishlistBusy ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Heart className={isWishlisted ? 'fill-black' : ''} />
                                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                            </button>
                        )}
                    </div>

                    {/* Stock Status */}
                    {selectedVariant && (
                        <div className="flex items-center gap-2 text-sm">
                            {selectedVariant.stock > 0 ? (
                                <CheckCircle className="text-primary" />
                            ) : (
                                <XCircle className="text-red-500" />
                            )}
                            <span className="text-white">
                                {selectedVariant.stock > 0 ? `${selectedVariant.stock} In Stock` : 'Out of Stock'}
                            </span>
                        </div>
                    )}

                    {/* Product Details */}
                    {product.careInstructions && (
                        <div className="border-t border-[#28392e] pt-6">
                            <h3 className="text-white font-bold text-lg mb-3">Care Instructions</h3>
                            <p className="text-[#9db9a6] text-sm">{product.careInstructions}</p>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#28392e] pt-6">
                        <div className="flex items-center gap-3">
                            <Truck className="text-secondary w-6 h-6" />
                            <div>
                                <p className="text-white text-sm font-medium">Free Shipping</p>
                                <p className="text-[#9db9a6] text-xs">On orders over ₹10,000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-secondary w-6 h-6" />
                            <div>
                                <p className="text-white text-sm font-medium">100% Authentic</p>
                                <p className="text-[#9db9a6] text-xs">Premium Quality</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <RefreshCw className="text-secondary w-6 h-6" />
                            <div>
                                <p className="text-white text-sm font-medium">Easy Returns</p>
                                <p className="text-[#9db9a6] text-xs">7 Days Return Policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;