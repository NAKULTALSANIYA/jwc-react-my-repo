import React, { useEffect } from 'react';
import { X, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    const product = video.productId;

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative bg-surface-dark rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                    {/* Video Section */}
                    <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-xl">
                            <video 
                                src={video.url} 
                                controls 
                                autoPlay
                                className="w-full aspect-video object-cover rounded-xl"
                                poster={video.thumbnailUrl}
                            />
                        </div>
                        <div>
                            <h2 className="text-white text-2xl font-bold mb-2">{video.title}</h2>
                            <p className="text-white/70 text-sm leading-relaxed">{video.description}</p>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    {product ? (
                        <div className="space-y-6">
                            <div>
                                <span className="text-primary text-xs font-bold tracking-widest uppercase">Featured Product</span>
                                <h3 className="text-white text-3xl font-bold mt-2 mb-4">{product.name}</h3>
                                
                                {/* Product Image */}
                                {product.images && product.images.length > 0 && (
                                    <div className="relative overflow-hidden rounded-xl mb-4">
                                        <img 
                                            src={product.images[0]} 
                                            alt={product.name}
                                            className="w-full h-64 object-cover rounded-xl"
                                        />
                                    </div>
                                )}

                                {/* Product Description */}
                                {product.description && (
                                    <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-3">
                                        {product.description}
                                    </p>
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-secondary text-3xl font-bold">₹ {product.price?.toLocaleString()}</span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <>
                                            <span className="text-white/40 text-lg line-through">₹ {product.originalPrice.toLocaleString()}</span>
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Link 
                                        to={`/products/${product.slug || product._id}`}
                                        className="flex-1 bg-primary hover:bg-white text-background-dark hover:text-background-dark px-6 py-3.5 rounded-full font-bold text-center transition-all duration-300 shadow-lg"
                                    >
                                        View Details
                                    </Link>
                                    <button 
                                        className="bg-surface-dark hover:bg-primary border border-primary/30 hover:border-primary text-white p-3.5 rounded-full transition-all duration-300"
                                        aria-label="Add to cart"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                    </button>
                                    <button 
                                        className="bg-surface-dark hover:bg-primary border border-primary/30 hover:border-primary text-white p-3.5 rounded-full transition-all duration-300"
                                        aria-label="Add to wishlist"
                                    >
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="text-white/50 text-center">No product associated with this video</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoModal;