import React from 'react';
import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart, getCartFromStorage } from '../hooks/useCart';
import { useUser } from '../hooks/useAuth';
import { ShoppingCart, Trash2, Truck, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const Cart = () => {
    const { data: user, isLoading: userLoading } = useUser();
    const { data: cartData, isLoading: cartLoading } = useCart();
    const updateCartItemMutation = useUpdateCartItem();
    const removeFromCartMutation = useRemoveFromCart();
    const isGuest = !user;
    
    // Use guest cart data for non-authenticated users
    const guestCartData = isGuest ? getCartFromStorage() : null;

    // Use guest cart data for non-authenticated users
    const displayCart = isGuest ? guestCartData : cartData;
    const displayItems = displayCart?.items || [];
    const items = displayItems;

    const updateQty = (variantId, size, color, currentQty, delta, productId) => {
        const newQty = Math.max(1, currentQty + delta);
        updateCartItemMutation.mutate({
            variantId,
            productId,
            quantity: newQty,
            size,
            color
        });
    };

    const removeItem = (variantId, productId, size, color) => {
        removeFromCartMutation.mutate({ variantId, productId, size, color });
    };

    const getUnitPrice = (item) => item?.finalPrice ?? item?.price ?? item?.product?.price ?? 0;
    const getImageUrl = (item) => {
        const product = item?.product;
        if (!product) return null;
        
        // Get the variant to check for variant-specific images
        const variant = product?.variants?.find(v => v._id?.toString?.() === item?.variantId?.toString?.());
        
        // Prefer variant images, fallback to product images
        const images = (variant?.images && variant.images.length > 0) 
            ? variant.images 
            : (product.images && product.images.length > 0 ? product.images : []);
        
        if (!images || images.length === 0) return null;
        
        const img = images[0];
        return typeof img === 'string' ? img : img.url || null;
    };
    const subtotal = items.reduce((acc, item) => acc + (getUnitPrice(item) * item.quantity), 0);
    const total = subtotal

    // Show loading state
    if (userLoading || cartLoading) {
        return (
            <div className="mx-auto max-w-300 px-4 py-8 lg:px-0">
                <div className="flex items-center justify-center py-20">
                    <div className="text-white/50 text-lg">Loading cart...</div>
                </div>
            </div>
        );
    }

    // Show login/guest cart page
    return (
        <div className="mx-auto max-w-300 px-4 py-8 lg:px-0">
            {/* Page Heading */}
            <div className="mb-8">
                <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 font-display">Your Shopping Bag</h1>
                <p className="text-secondary text-base font-normal leading-normal">
                    {displayItems.length} items in your cart | 
                    <Link className="text-secondary hover:underline ml-1" to="/products">Continue Shopping</Link>
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Cart Items List */}
                <div className="flex-1 w-full flex flex-col gap-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 border border-[#28392e] rounded-xl bg-surface-dark">
                            <div className="text-center max-w-md">
                                <ShoppingCart className="text-secondary w-16 h-16 mb-4 mx-auto" />
                                <h2 className="text-white text-2xl font-bold mb-3 font-display">Your Cart is Empty</h2>
                                <p className="text-white/60 mb-6">Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
                                <Link 
                                    to="/products" 
                                    className="inline-block px-6 py-3 bg-linear-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header for items (Desktop only) */}
                            <div className="hidden md:flex justify-between text-white/50 text-xs uppercase tracking-wider pb-2 border-b border-[#28392e] mb-2 px-4">
                                <span>Product</span>
                                <span>Total</span>
                            </div>

                            {items.map((item, idx) => (
                                <div
                                    key={`${item.product?._id || 'product'}-${item.variantId || 'variant'}-${item.size || 'size'}-${item.color || 'color'}-${idx}`}
                                    className="flex flex-col md:flex-row gap-4 bg-surface-dark px-4 py-4 rounded-xl border border-[#28392e] transition-all hover:border-[#3b5443] group"
                                >
                                    <div className="flex flex-1 items-start gap-5">
                                        <div className="relative shrink-0 overflow-hidden rounded-lg border border-[#28392e]">
                                            {getImageUrl(item) ? (
                                                <div
                                                    className="bg-center bg-no-repeat aspect-3/4 bg-cover w-22.5 md:w-25 hover:scale-105 transition-transform duration-500"
                                                    style={{ backgroundImage: `url('${getImageUrl(item)}')` }}
                                                ></div>
                                            ) : (
                                                <div className="w-22.5 md:w-25 h-30 md:h-33.25 flex items-center justify-center bg-[#111813] text-white/20 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col h-full justify-between gap-2">
                                            <div>
                                                <div className="flex justify-between md:hidden mb-1">
                                                    <span className="text-secondary text-sm font-bold">₹{(getUnitPrice(item) * item.quantity).toLocaleString()}</span>
                                                </div>
                                                <Link to={`/product/${item.product?._id}`} className="text-white text-lg font-bold leading-tight font-display hover:text-secondary transition-colors">{item.product?.name}</Link>
                                                <p className="text-white/60 text-sm font-normal mt-1">Size: {item.size} | Color: {item.color}</p>
                                                <p className="text-[#5e7668] text-xs mt-1">Ref: {item.product?.sku || item.product?._id}</p>
                                            </div>
                                            <div className="flex items-center gap-6 mt-2 md:mt-auto">
                                                <div className="flex items-center border border-[#28392e] rounded-lg bg-[#111813]">
                                                    <button 
                                                        onClick={() => updateQty(item.variantId, item.size, item.color, item.quantity, -1, item.product?._id)} 
                                                        disabled={updateCartItemMutation.isPending}
                                                        className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-l-lg hover:bg-[#1c2b22] disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    <input className="text-white w-8 p-0 text-center bg-transparent border-none text-sm focus:ring-0" readOnly type="text" value={item.quantity} />
                                                    <button 
                                                        onClick={() => updateQty(item.variantId, item.size, item.color, item.quantity, 1, item.product?._id)} 
                                                        disabled={updateCartItemMutation.isPending}
                                                        className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-r-lg hover:bg-[#1c2b22] disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => removeItem(item.variantId, item.product?._id, item.size, item.color)} 
                                                    disabled={removeFromCartMutation.isPending}
                                                    className="text-sm text-[#ff6b6b] hover:text-[#ff4c4c] flex items-center gap-1 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex shrink-0 flex-col items-end justify-start">
                                        <div className="text-right">
                                            <p className="text-secondary text-xl font-bold font-display">₹{(getUnitPrice(item) * item.quantity).toLocaleString()}</p>
                                            {item.quantity > 1 && <p className="text-xs text-white/50 mt-1">₹{getUnitPrice(item).toLocaleString()} each</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Info Strip */}
                    <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                            <ShieldCheck className="text-secondary" />
                            100% Authentic Fabric
                        </div>
                    </div>
                </div>

                {/* Order Summary Sticky */}
                {items.length > 0 && (
                    <div className="w-full lg:w-95 shrink-0 lg:sticky lg:top-24">
                        <div className="flex flex-col gap-6 rounded-xl border border-solid border-[#3b5443] bg-surface-dark p-6 shadow-xl">
                            <h2 className="text-white text-xl font-bold leading-tight font-display pb-4 border-b border-[#28392e]">Order Summary</h2>
                            {/* Calculations */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between text-white/70 text-sm">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white/70 text-sm">
                                    <span>Discount</span>
                                    <span className="text-primary">- ₹0</span>
                                </div>
                            </div>
                            {/* Coupon */}
                            {/* <div className="flex gap-2 py-2">
                                <input className="flex-1 rounded-lg border border-[#3b5443] bg-[#111813] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-secondary focus:outline-none" placeholder="Enter coupon code" />
                                <button type="button" className="rounded-lg bg-[#28392e] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3b5443] hover:text-secondary">Apply</button>
                            </div> */}
                            {/* Total */}
                            <div className="border-t border-[#28392e] pt-4">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-white text-base font-bold">Total Amount</span>
                                    <span className="text-secondary text-2xl font-black font-display tracking-tight">₹{total.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-[#5e7668] text-right">Including all taxes & charges</p>
                            </div>
                            {/* Checkout Button */}
                            {isGuest ? (
                                <Link 
                                    to="/login" 
                                    className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] py-4 text-[#0f1c15] shadow-lg transition-all active:scale-[0.98]"
                                >
                                    <span className="relative z-10 text-base font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        Login to Checkout
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            ) : (
                                <Link to="/checkout" className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] py-4 text-[#0f1c15] shadow-lg transition-all active:scale-[0.98]">
                                    <span className="relative z-10 text-base font-bold uppercase tracking-widest flex items-center gap-2">
                                        Proceed to Checkout
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            )}
                            {/* Trust badges */}
                            <div className="flex justify-center gap-4 mt-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                                <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] text-white">VISA</div>
                                <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] text-white">MC</div>
                                <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] text-white">UPI</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;