import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestOnlyRoute from './components/GuestOnlyRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import Collection from './pages/Collection';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Register from './pages/Register';
import NewArrivals from './pages/NewArrivals';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import OAuthCallback from './pages/OAuthCallback';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import NotFound from './pages/NotFound';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="Products" element={<Products />} />
            <Route path="collection" element={<Collection />} />
            <Route path="new-arrivals" element={<NewArrivals />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:orderId/success" element={<OrderSuccess />} />
            <Route path="order/:orderId" element={<Navigate to="success" replace />} />
            <Route path="product/:id" element={<ProductDetail />} />
            {/* Protected under Layout */}
            <Route element={<ProtectedRoute />}> 
              <Route path="profile" element={<Profile />} />
            </Route>
            {/* Guest-only under Layout */}
            <Route element={<GuestOnlyRoute />}> 
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
          </Route>
          <Route path="/auth/callback" element={<OAuthCallback />} />
          {/* 404 Not Found - Catch all other routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;