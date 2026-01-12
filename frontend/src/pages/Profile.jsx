import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser, useUpdateProfile, useLogout } from '../hooks/useAuth';
import { useWishlist, useRemoveFromWishlist } from '../hooks/useExtras';
import * as userService from '../api/services/user.service';
import * as orderService from '../api/services/order.service';
import * as cartService from '../api/services/cart.service';
import { queryKeys } from '../api/queryClient';
import { LogOut, ShoppingBag, Trash2, ShoppingCart, Heart } from 'lucide-react';

const SectionCard = ({ title, children }) => (
  <div className="bg-[#0b180f] border border-[#28392e] rounded-xl p-6">
    <h2 className="text-white font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Profile = () => {
  const { data: user } = useUser();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'details');
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // Update activeTab when searchParams change
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Addresses
  const { data: addressesData, isLoading: addrLoading } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: async () => {
      const res = await userService.getAddresses();
      return res.data?.addresses || res.data?.data?.addresses || [];
    },
    enabled: !!user, // Only fetch if user is authenticated
  });

  const addAddressMut = useMutation({
    mutationFn: userService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });

  const deleteAddressMut = useMutation({
    mutationFn: userService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });

  // Orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: queryKeys.orders.list,
    queryFn: async () => {
      const res = await orderService.getOrders();
      return res.data?.orders || res.data?.data?.orders || [];
    },
    enabled: !!user, // Only fetch if user is authenticated
  });

  // Personal details form
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  React.useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', avatar: user.avatar || '' });
    }
  }, [user]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  };
  // Address form state (for add)
  const initialAddress = {
    type: 'home',
    name: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    isDefault: false,
  };

  const [newAddress, setNewAddress] = React.useState(initialAddress);

  const handleAddAddress = (e) => {
    e.preventDefault();
    addAddressMut.mutate(newAddress, {
      onSuccess: () => setNewAddress(initialAddress),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-white/60">Manage your personal details, addresses, and orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { key: 'details', label: 'Personal Details' },
          { key: 'addresses', label: 'Addresses' },
          { key: 'orders', label: 'Order History' },
          { key: 'wishlist', label: 'Wishlist' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full border transition-colors ${
              activeTab === tab.key
                ? 'border-secondary text-white bg-[#28392e]'
                : 'border-[#28392e] text-white/70 hover:border-secondary hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="ml-auto px-4 py-2 rounded-full border border-[#28392e] text-white/80 hover:border-secondary hover:text-white"
        >
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0b180f] border border-[#28392e] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <LogOut className="text-yellow-500 w-8 h-8" />
              <div>
                <h3 className="text-white text-lg font-bold mb-2">Confirm Logout</h3>
                <p className="text-white/70 text-sm">Are you sure you want to logout? You'll need to login again to access your account.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-md border border-[#28392e] text-white/80 hover:border-secondary hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout.mutate();
                }}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'details' && (
        <SectionCard title="Personal Details">
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-1">Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Email</label>
              <input
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-secondary text-background-dark font-semibold hover:brightness-110"
              >
                Save Changes
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Your Addresses">
            {addrLoading ? (
              <div className="text-white/70">Loading addresses...</div>
            ) : (
              <div className="space-y-4">
                {(addressesData || []).map((addr) => (
                  <div key={addr._id} className="border border-[#28392e] rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{addr.name} • {addr.phone}</div>
                        <div className="text-white/70 text-sm">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state}, {addr.country} - {addr.postalCode}
                        </div>
                        <div className="text-white/50 text-xs mt-1">Type: {addr.type} {addr.isDefault ? '• Default' : ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteAddressMut.mutate(addr._id)}
                          className="px-3 py-1.5 rounded-md border border-[#28392e] text-white/80 hover:border-secondary"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Add New Address">
            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 mb-1">Type</label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress((p) => ({ ...p, type: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 mb-1">Name</label>
                <input
                  value={newAddress.name}
                  onChange={(e) => setNewAddress((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Phone</label>
                <input
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Address Line 1</label>
                <input
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress((p) => ({ ...p, addressLine1: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Address Line 2</label>
                <input
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress((p) => ({ ...p, addressLine2: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">City</label>
                <input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">State</label>
                <input
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Country</label>
                <input
                  value={newAddress.country}
                  onChange={(e) => setNewAddress((p) => ({ ...p, country: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Postal Code</label>
                <input
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))}
                  className="w-full bg-[#0e2013] border border-[#28392e] rounded-md px-3 py-2 text-white"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress((p) => ({ ...p, isDefault: e.target.checked }))}
                />
                <span className="text-white/80">Set as default</span>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="px-4 py-2 rounded-md bg-secondary text-background-dark font-semibold hover:brightness-110">
                  Add Address
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {activeTab === 'orders' && (
        <SectionCard title="Order History">
          {ordersLoading ? (
            <div className="text-white/70">Loading orders...</div>
          ) : !ordersData || ordersData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="text-secondary w-16 h-16 mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">No Orders Yet</h3>
              <p className="text-white/60 mb-6 max-w-md">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <Link
                to="/products" 
                className="px-6 py-3 bg-gradient-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData.map((order) => (
                <div key={order._id} className="border border-[#28392e] rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Order #{order.orderNumber}</div>
                      <div className="text-white/70 text-sm">Status: {order.status} • Amount: ₹{order.pricing?.finalAmount?.toLocaleString()}</div>
                      <div className="text-white/50 text-xs mt-1">Items: {order.items?.length || 0} • Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/order/${order._id}/success`} className="px-3 py-1.5 rounded-md border border-[#28392e] text-white/80 hover:border-secondary">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === 'wishlist' && <WishlistTab />}
    </div>
  );
};

const WishlistTab = () => {
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlist();
  const queryClient = useQueryClient();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useMutation({
    mutationFn: async (item) => {
      const product = item.product || item;
      return cartService.addToCart({
        productId: product?._id,
        variantId: item._id,
        quantity: 1,
        size: item.size?.[0] || 'M',
        color: item.color?.[0] || item.colors?.[0] || 'Black',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });

  const items = wishlistData?.items || [];

  if (wishlistLoading) {
    return <SectionCard title="Wishlist"><div className="text-white/70">Loading wishlist...</div></SectionCard>;
  }

  if (!items || items.length === 0) {
    return (
      <SectionCard title="Wishlist">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="text-secondary w-16 h-16 mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Your Wishlist is Empty</h3>
          <p className="text-white/60 mb-6 max-w-md">
            Start adding your favorite items to your wishlist!
          </p>
          <Link 
            to="/products" 
            className="px-6 py-3 bg-gradient-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all"
          >
            Browse Products
          </Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Wishlist">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const product = item.product || item;
          const imageUrl = product?.images?.[0];
          
          // Get the variant-specific price
          const variant = product?.variants?.find(v => v._id === item.variantId);
          const finalPrice = variant?.finalPrice ?? variant?.price ?? product?.finalPrice ?? product?.price ?? 0;

          return (
            <div key={item._id} className="border border-[#28392e] rounded-lg overflow-hidden bg-surface-dark hover:border-secondary transition-colors">
              {/* Product Image */}
              <div className="relative overflow-hidden bg-[#0b180f] h-48">
                {imageUrl && (
                  <div
                    className="w-full h-full bg-center bg-cover hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundImage: typeof imageUrl === 'string' ? `url('${imageUrl}')` : `url('${imageUrl.url}')`,
                    }}
                  ></div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${product?._id}`} className="text-white font-bold text-sm hover:text-secondary transition-colors line-clamp-2">
                  {product?.name}
                </Link>
                <p className="text-white/60 text-xs mt-2">Ref: {product?.sku || product?._id}</p>

                {/* Price */}
                <div className="mt-3 mb-4">
                  <p className="text-secondary text-lg font-bold font-display">₹{finalPrice.toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      addToCartMutation.mutate({
                        ...item,
                        variantId: item.variantId || item._id,
                      })
                    }
                    disabled={addToCartMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all disabled:opacity-50 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlistMutation.mutate(item.variantId || product?._id)}
                    disabled={removeFromWishlistMutation.isPending}
                    className="px-3 py-2 rounded-lg border border-[#28392e] text-[#ff6b6b] hover:text-[#ff4c4c] hover:border-[#ff6b6b] transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default Profile;