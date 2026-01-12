import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ShoppingBag } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-0 min-h-[calc(100vh-300px)] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center py-20 gap-8 text-center">
                {/* Error Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-[#c49e50]/20 rounded-full blur-2xl w-40 h-40 mx-auto"></div>
                    <AlertCircle className="text-secondary w-32 h-32 relative z-10" strokeWidth={1} />
                </div>

                {/* Error Code */}
                <div>
                    <h1 className="text-white text-7xl md:text-8xl font-black leading-none tracking-[-0.033em] mb-2 font-display">
                        404
                    </h1>
                    <p className="text-secondary text-lg md:text-xl font-bold">Page Not Found</p>
                </div>

                {/* Error Message */}
                <div className="max-w-md">
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 font-display">Oops! Something went wrong</h2>
                    <p className="text-white/60 text-base leading-relaxed">
                        The page you're looking for doesn't exist or has been moved. Don't worry, we've got plenty of amazing products waiting for you!
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Link 
                        to="/" 
                        className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-[#c49e50] hover:from-[#e3c578] hover:to-[#c49e50] text-[#0f1c15] font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg"
                    >
                        <Home className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                        <span>Back to Home</span>
                    </Link>
                    <Link 
                        to="/products" 
                        className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-[#28392e] hover:bg-[#3b5443] text-white font-bold rounded-lg transition-all active:scale-[0.98] border border-[#3b5443]"
                    >
                        <ShoppingBag className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-xs opacity-30">
                    <div className="h-16 bg-gradient-to-br from-secondary/10 to-transparent rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-secondary/10 to-transparent rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-secondary/10 to-transparent rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
