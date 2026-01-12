# Quick Reference - Available Hooks

## 🔐 Authentication (`useAuth.js`)

```jsx
import { 
  useLogin, 
  useRegister, 
  useLogout, 
  useUser,
  useIsAuthenticated,
  useIsAdmin,
  useUpdateProfile,
  useGoogleLogin,
  useForgotPassword,
  useResetPassword,
  useChangePassword
} from '../hooks/useAuth';
```

| Hook | Purpose | Returns | Usage |
|------|---------|---------|-------|
| `useLogin()` | Login user | mutation | `mutation.mutate({ email, password })` |
| `useRegister()` | Register new user | mutation | `mutation.mutate({ firstName, lastName, email, password })` |
| `useLogout()` | Logout user | mutation | `mutation.mutate()` |
| `useUser()` | Get current user | query | `{ data: user, isLoading }` |
| `useIsAuthenticated()` | Check auth status | object | `{ isAuthenticated, isLoading, user }` |
| `useIsAdmin()` | Check if admin | boolean | `true/false` |
| `useUpdateProfile()` | Update user profile | mutation | `mutation.mutate({ firstName, ... })` |

---

## 🛍️ Products (`useProducts.js`)

```jsx
import { 
  useProducts, 
  useProduct, 
  useProductBySlug,
  useFeaturedProducts, 
  useNewArrivals,
  useSearchProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
  useCategory
} from '../hooks/useProducts';
```

| Hook | Purpose | Parameters | Returns |
|------|---------|------------|---------|
| `useProducts(filters)` | Get all products | `{ category, limit, ... }` | query |
| `useProduct(id)` | Get product by ID | product ID | query |
| `useProductBySlug(slug)` | Get by slug | product slug | query |
| `useFeaturedProducts()` | Get featured | none | query |
| `useNewArrivals()` | Get new arrivals | none | query |
| `useSearchProducts(query)` | Search | search query | query |
| `useCategories()` | Get all categories | none | query |
| `useCreateProduct()` | Create product (admin) | none | mutation |
| `useUpdateProduct()` | Update product (admin) | none | mutation |
| `useDeleteProduct()` | Delete product (admin) | none | mutation |

---

## 🛒 Cart (`useCart.js`)

```jsx
import { 
  useCart, 
  useCartCount,
  useCartTotals,
  useAddToCart, 
  useUpdateCartItem, 
  useRemoveFromCart,
  useClearCart
} from '../hooks/useCart';
```

| Hook | Purpose | Returns | Example |
|------|---------|---------|---------|
| `useCart()` | Get cart | query | `{ data: cart, isLoading }` |
| `useCartCount()` | Get item count | number | `5` |
| `useCartTotals()` | Get totals | object | `{ subtotal, total, tax, ... }` |
| `useAddToCart()` | Add to cart | mutation | `mutate({ productId, quantity, size, color })` |
| `useUpdateCartItem()` | Update quantity | mutation | `mutate({ productId, quantity })` |
| `useRemoveFromCart()` | Remove item | mutation | `mutate(productId)` |
| `useClearCart()` | Clear cart | mutation | `mutate()` |

---

## 📦 Orders (`useOrders.js`)

```jsx
import { 
  useOrders, 
  useOrder, 
  useCreateOrder,
  useCancelOrder,
  useUpdateOrderStatus,
  useTrackOrder
} from '../hooks/useOrders';
```

| Hook | Purpose | Parameters | Returns |
|------|---------|------------|---------|
| `useOrders()` | Get user orders | none | query |
| `useOrder(id)` | Get order by ID | order ID | query |
| `useCreateOrder()` | Checkout | none | mutation |
| `useCancelOrder()` | Cancel order | none | mutation |
| `useUpdateOrderStatus()` | Update status (admin) | none | mutation |
| `useTrackOrder(id)` | Track order | order ID | query |

---

## ❤️ Wishlist (`useExtras.js`)

```jsx
import { 
  useWishlist, 
  useAddToWishlist, 
  useRemoveFromWishlist,
  useToggleWishlist,
  useClearWishlist
} from '../hooks/useExtras';
```

| Hook | Purpose | Returns |
|------|---------|---------|
| `useWishlist()` | Get wishlist | query |
| `useAddToWishlist()` | Add to wishlist | mutation |
| `useRemoveFromWishlist()` | Remove from wishlist | mutation |
| `useToggleWishlist()` | Toggle wishlist | object with `toggleWishlist(productId)` |
| `useClearWishlist()` | Clear wishlist | mutation |

---

## ⭐ Reviews (`useExtras.js`)

```jsx
import { 
  useProductReviews, 
  useUserReviews,
  useCreateReview, 
  useUpdateReview, 
  useDeleteReview
} from '../hooks/useExtras';
```

| Hook | Purpose | Parameters |
|------|---------|------------|
| `useProductReviews(productId)` | Get product reviews | product ID |
| `useUserReviews()` | Get user's reviews | none |
| `useCreateReview()` | Create review | mutation |
| `useUpdateReview()` | Update review | mutation |
| `useDeleteReview()` | Delete review | mutation |

---

## 📊 Dashboard - Admin (`useExtras.js`)

```jsx
import { 
  useDashboardOverview, 
  useDashboardStats,
  useRevenueAnalytics,
  useTopProducts,
  useRecentOrders
} from '../hooks/useExtras';
```

---

## 🎨 Common Patterns

### Pattern 1: Fetching Data

```jsx
const { data, isLoading, error } = useProducts();

if (isLoading) return <Loader />;
if (error) return <Error />;
return <ProductList products={data} />;
```

### Pattern 2: Mutation

```jsx
const mutation = useAddToCart();

const handleClick = () => {
  mutation.mutate({ productId: '123', quantity: 1 });
};

return (
  <button 
    onClick={handleClick}
    disabled={mutation.isPending}
  >
    {mutation.isPending ? 'Adding...' : 'Add to Cart'}
  </button>
);
```

### Pattern 3: Optimistic Update (Already Handled)

Cart and wishlist hooks automatically handle optimistic updates. Just use them!

```jsx
const addToCart = useAddToCart();
// UI updates instantly, then syncs with server
addToCart.mutate({ productId, quantity: 1 });
```

---

## 🔧 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚦 Query States

Every query returns:

```jsx
{
  data,           // The data
  isLoading,      // Initial load
  isFetching,     // Background refetch
  isError,        // Error occurred
  error,          // Error object
  isSuccess,      // Request succeeded
  refetch,        // Manual refetch function
}
```

Every mutation returns:

```jsx
{
  mutate,         // Function to call
  isPending,      // Mutation in progress
  isError,        // Error occurred
  error,          // Error object
  isSuccess,      // Mutation succeeded
  data,           // Response data
  reset,          // Reset mutation state
}
```

---

## ✅ Checklist for Integrating a Component

1. ✅ Identify what data you need
2. ✅ Import the appropriate hook
3. ✅ Call the hook in your component
4. ✅ Handle loading state
5. ✅ Handle error state
6. ✅ Render data
7. ✅ For mutations: disable buttons during pending
8. ✅ Show success/error feedback

---

## 🎯 Examples for Each Page

### Home.jsx
```jsx
import { useFeaturedProducts } from '../hooks/useProducts';
const { data: featured } = useFeaturedProducts();
```

### Collection.jsx
```jsx
import { useProducts } from '../hooks/useProducts';
const { data: products } = useProducts({ category: 'men' });
```

### ProductDetail.jsx
```jsx
import { useProduct } from '../hooks/useProducts';
import { useParams } from 'react-router-dom';
const { id } = useParams();
const { data: product } = useProduct(id);
```

### Cart.jsx
```jsx
import { useCart, useCartTotals, useUpdateCartItem, useRemoveFromCart } from '../hooks/useCart';
const { data: cart } = useCart();
const { total } = useCartTotals();
```

### Checkout.jsx
```jsx
import { useCreateOrder } from '../hooks/useOrders';
const createOrder = useCreateOrder();
const handleCheckout = () => createOrder.mutate(orderData);
```

### Men.jsx / NewArrivals.jsx
```jsx
import { useProducts, useNewArrivals } from '../hooks/useProducts';
const { data: products } = useProducts({ gender: 'men' });
const { data: newArrivals } = useNewArrivals();
```

---

## 🔗 Related Files

- **Axios Config**: `src/api/axios.js`
- **Query Client**: `src/api/queryClient.js`
- **API Services**: `src/api/services/*`
- **Custom Hooks**: `src/hooks/*`
- **Full Guide**: `INTEGRATION_GUIDE.md`

---

**Remember: Never make API calls directly in components. Always use the hooks!**
