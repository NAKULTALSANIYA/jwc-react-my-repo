
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    Users,
    Mail,
    LogOut,
    ChevronRight,
    X,
    Tag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Products', icon: <ShoppingBag size={20} />, path: '/products' },
        { name: 'Categories', icon: <Tag size={20} />, path: '/categories' },
        { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
        { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
        { name: 'Contacts', icon: <Mail size={20} />, path: '/contacts' },
    ];

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            <div className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
                <div className="p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider flex items-center gap-2">
                            <span className="text-blue-500">JWC</span> STORE
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Admin Management</p>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Confirm Logout</h3>
                                <p className="text-sm text-slate-500">Are you sure you want to logout?</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-6">
                            You will be redirected to the login page and will need to sign in again to access the admin panel.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
