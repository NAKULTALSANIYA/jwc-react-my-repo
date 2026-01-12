
import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-slate-200">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold">Admin User</p>
                        <p className="text-xs text-slate-500">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        AU
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
