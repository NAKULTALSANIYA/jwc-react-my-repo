# TanStack Query Integration Guide

## Overview

This guide explains how to connect your existing React components to the backend API using TanStack Query (React Query v5). The integration is complete with authentication, data fetching, mutations, and optimistic updates.

## 📁 Project Structure

```
frontend/src/
├── api/
│   ├── axios.js                     # Axios instance with JWT interceptors
│   ├── queryClient.js               # QueryClient configuration & query keys
│   └── services/                    # API service functions
│       ├── auth.service.js
│       ├── product.service.js
│       ├── category.service.js
│       ├── cart.service.js
│       ├── order.service.js
│       ├── wishlist.service.js
│       ├── review.service.js
│       └── dashboard.service.js
├── hooks/                           # Custom React Query hooks
│   ├── useAuth.js
│   ├── useProducts.js
│   ├── useCart.js
│   ├── useOrders.js
│   └── useExtras.js
└── pages/                           # Your existing UI components
```

---

## 🔐 Authentication

### Login Example

```jsx
import { useLogin, useUser } from '../hooks/useAuth';

function LoginPage() {
  const loginMutation = useLogin();
  const { data: user, isLoading } = useUser();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({
      email: 'user@example.com',
      password: 'password123',
    });
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Your existing form UI */}
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      
      {loginMutation.isError && (
        <div className="error">
          {loginMutation.error?.response?.data?.message}
        </div>
      )}
    </form>
  );
}
```

### Protected Routes

```jsx
import { useIsAuthenticated } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}
```

### Logout

```jsx
import { useLogout } from '../hooks/useAuth';

function Header() {
  const logoutMutation = useLogout();

  return (
    <button onClick={() => logoutMutation.mutate()}>
      Logout
    </button>
  );
}
```

---

## 🛍️ Products

### Fetching Product List

```jsx
import { useProducts } from '../hooks/useProducts';

function ProductList() {
  const { data: products, isLoading, error } = useProducts({
    category: 'men',
    limit: 12,
  });

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="product-grid">
      {products?.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### Product Detail Page

```jsx
import { useProduct } from '../hooks/useProducts';
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      {/* Your existing UI */}
    </div>
  );
}
```

### Featured Products

```jsx
import { useFeaturedProducts } from '../hooks/useProducts';

function HomePage() {
  const { data: featured } = useFeaturedProducts();

  return (
    <section>
      <h2>Featured Products</h2>
      <div className="grid">
        {featured?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

### Categories

```jsx
import { useCategories } from '../hooks/useProducts';

function CategoryNav() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <div>Loading...</div>;

  return (
    <nav>
      {categories?.map((cat) => (
        <Link key={cat._id} to={`/category/${cat._id}`}>
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
```

---

## 🛒 Shopping Cart

### Display Cart

```jsx
import { useCart, useCartTotals } from '../hooks/useCart';

function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { subtotal, total, itemCount } = useCartTotals();

  if (isLoading) return <div>Loading cart...</div>;

  return (
    <div>
      <h1>Shopping Cart ({itemCount} items)</h1>
      {cart?.items?.map((item) => (
        <CartItem key={item._id} item={item} />
      ))}
      <div>
        <p>Subtotal: ${subtotal}</p>
        <p>Total: ${total}</p>
      </div>
    </div>
  );
}
```

### Add to Cart with Optimistic Update

```jsx
import { useAddToCart } from '../hooks/useCart';

function ProductCard({ product }) {
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    addToCart.mutate({
      productId: product._id,
      quantity: 1,
      size: 'L',
      color: 'Red',
    });
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button 
        onClick={handleAddToCart}
        disabled={addToCart.isPending}
      >
        {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
      </button>
      
      {addToCart.isSuccess && <span>✓ Added!</span>}
    </div>
  );
}
```

### Update Cart Item Quantity

```jsx
import { useUpdateCartItem } from '../hooks/useCart';

function CartItem({ item }) {
  const updateItem = useUpdateCartItem();

  const handleQuantityChange = (newQuantity) => {
    updateItem.mutate({
      productId: item.product._id,
      quantity: newQuantity,
      size: item.size,
      color: item.color,
    });
  };

  return (
    <div>
      <img src={item.product.image} alt={item.product.name} />
      <h4>{item.product.name}</h4>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => handleQuantityChange(Number(e.target.value))}
        min="1"
      />
    </div>
  );
}
```

### Remove from Cart

```jsx
import { useRemoveFromCart } from '../hooks/useCart';

function CartItem({ item }) {
  const removeItem = useRemoveFromCart();

  return (
    <div>
      {/* ... */}
      <button onClick={() => removeItem.mutate(item.product._id)}>
        Remove
      </button>
    </div>
  );
}
```

### Cart Count Badge (Header)

```jsx
import { useCartCount } from '../hooks/useCart';

function Header() {
  const cartCount = useCartCount();

  return (
    <Link to="/cart">
      <ShoppingCartIcon />
      {cartCount > 0 && <span className="badge">{cartCount}</span>}
    </Link>
  );
}
```

---

## 📦 Orders

### Create Order (Checkout)

```jsx
import { useCreateOrder } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';

function CheckoutPage() {
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();

  const handleCheckout = (shippingAddress) => {
    createOrder.mutate({
      items: cart.items,
      shippingAddress,
      paymentMethod: 'credit_card',
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCheckout({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      });
    }}>
      {/* Your checkout form UI */}
      <button disabled={createOrder.isPending}>
        {createOrder.isPending ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}
```

### View Order History

```jsx
import { useOrders } from '../hooks/useOrders';

function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1>My Orders</h1>
      {orders?.map((order) => (
        <div key={order._id}>
          <h3>Order #{order._id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Order Details

```jsx
import { useOrder } from '../hooks/useOrders';
import { useParams } from 'react-router-dom';

function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Order #{order._id}</h1>
      <p>Status: {order.status}</p>
      
      <h2>Items</h2>
      {order.items.map((item) => (
        <div key={item._id}>
          <p>{item.product.name} x {item.quantity}</p>
        </div>
      ))}
      
      <h2>Shipping Address</h2>
      <p>{order.shippingAddress.street}</p>
      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
    </div>
  );
}
```

---

## ❤️ Wishlist

### Toggle Wishlist

```jsx
import { useToggleWishlist, useWishlist } from '../hooks/useExtras';

function ProductCard({ product }) {
  const { data: wishlist } = useWishlist();
  const { toggleWishlist, isLoading } = useToggleWishlist();

  const isInWishlist = wishlist?.items?.some(
    (item) => item.product._id === product._id
  );

  return (
    <div>
      <h3>{product.name}</h3>
      <button 
        onClick={() => toggleWishlist(product._id)}
        disabled={isLoading}
      >
        {isInWishlist ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

### Display Wishlist

```jsx
import { useWishlist } from '../hooks/useExtras';

function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Wishlist</h1>
      {wishlist?.items?.map((item) => (
        <ProductCard key={item._id} product={item.product} />
      ))}
    </div>
  );
}
```

---

## ⭐ Reviews

### Display Product Reviews

```jsx
import { useProductReviews } from '../hooks/useExtras';

function ProductReviews({ productId }) {
  const { data: reviews, isLoading } = useProductReviews(productId);

  if (isLoading) return <div>Loading reviews...</div>;

  return (
    <div>
      <h2>Customer Reviews</h2>
      {reviews?.map((review) => (
        <div key={review._id}>
          <p>⭐ {review.rating}/5</p>
          <p>{review.comment}</p>
          <p>- {review.user.firstName}</p>
        </div>
      ))}
    </div>
  );
}
```

### Create Review

```jsx
import { useCreateReview } from '../hooks/useExtras';

function ReviewForm({ productId }) {
  const createReview = useCreateReview();

  const handleSubmit = (e) => {
    e.preventDefault();
    createReview.mutate({
      productId,
      rating: 5,
      comment: 'Great product!',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your review form UI */}
      <button disabled={createReview.isPending}>
        Submit Review
      </button>
      
      {createReview.isSuccess && <p>✓ Review submitted!</p>}
    </form>
  );
}
```

---

## 🎛️ Admin Dashboard

### Dashboard Overview

```jsx
import { useDashboardOverview } from '../hooks/useExtras';

function AdminDashboard() {
  const { data: overview, isLoading } = useDashboardOverview();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div>Total Revenue: ${overview.totalRevenue}</div>
        <div>Total Orders: {overview.totalOrders}</div>
        <div>Total Products: {overview.totalProducts}</div>
        <div>Total Users: {overview.totalUsers}</div>
      </div>
    </div>
  );
}
```

### Admin Product Management

```jsx
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';

function AdminProductForm() {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreate = (productData) => {
    createProduct.mutate(productData);
  };

  const handleUpdate = (id, productData) => {
    updateProduct.mutate({ id, data: productData });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this product?')) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div>
      {/* Your admin form UI */}
    </div>
  );
}
```

---

## 🔄 Loading & Error States

### Comprehensive Example

```jsx
import { useProducts } from '../hooks/useProducts';

function ProductsPage() {
  const { 
    data: products, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProducts();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader">Loading products...</div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="error-container">
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return <div>No products found.</div>;
  }

  // Success state
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

---

## 🔍 Search

```jsx
import { useState } from 'react';
import { useSearchProducts } from '../hooks/useProducts';

function SearchBar() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchProducts(query);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      
      {isLoading && <div>Searching...</div>}
      
      {results && (
        <div className="search-results">
          {results.map((product) => (
            <div key={product._id}>{product.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Best Practices

### 1. Always Handle Loading States

```jsx
if (isLoading) return <Skeleton />;
```

### 2. Handle Errors Gracefully

```jsx
if (isError) return <ErrorMessage error={error} />;
```

### 3. Use Optimistic Updates for Better UX

```jsx
// Optimistic updates are already implemented in:
// - useAddToCart
// - useUpdateCartItem
// - useRemoveFromCart
// - useAddToWishlist
// - useRemoveFromWishlist
```

### 4. Disable Buttons During Mutations

```jsx
<button disabled={mutation.isPending}>
  {mutation.isPending ? 'Saving...' : 'Save'}
</button>
```

### 5. Show Success Feedback

```jsx
{mutation.isSuccess && <div>✓ Success!</div>}
```

---

## 🔧 Advanced Usage

### Manual Query Invalidation

```jsx
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryClient';

function SomeComponent() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate all product queries
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### Prefetching Data

```jsx
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryClient';
import * as productService from '../api/services/product.service';

function ProductCard({ product }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch product details on hover
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(product._id),
      queryFn: () => productService.getProductById(product._id),
    });
  };

  return (
    <Link 
      to={`/product/${product._id}`}
      onMouseEnter={handleMouseEnter}
    >
      {product.name}
    </Link>
  );
}
```

---

## 🎉 Summary

You now have a complete TanStack Query integration with:

✅ **Authentication** - Login, register, logout, protected routes  
✅ **Products** - List, detail, search, categories  
✅ **Cart** - Add, update, remove with optimistic updates  
✅ **Orders** - Create, view history, track  
✅ **Wishlist** - Toggle, view with optimistic updates  
✅ **Reviews** - Create, view, manage  
✅ **Admin** - Dashboard, product management  

**All hooks are ready to use. Just import and start connecting your UI!**

---

## 🚀 Next Steps

1. Start with authentication - connect Login/Register (already done!)
2. Connect your Home page to `useFeaturedProducts()`
3. Connect Collection page to `useProducts()`
4. Connect ProductDetail page to `useProduct(id)`
5. Connect Cart page to `useCart()` and cart mutations
6. Connect Checkout to `useCreateOrder()`

**No API calls should be made directly in components. Always use the hooks!**
