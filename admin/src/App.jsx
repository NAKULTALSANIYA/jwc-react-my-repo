
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddEditProduct from './pages/AddEditProduct';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Contacts from './pages/Contacts';
import Videos from './pages/Videos';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/add" element={<AddEditProduct />} />
              <Route path="/products/edit/:id" element={<AddEditProduct />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order-detail/:orderId" element={<OrderDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/videos" element={<Videos />} />
            </Route>
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
