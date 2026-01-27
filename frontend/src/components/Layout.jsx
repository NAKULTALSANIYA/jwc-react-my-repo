import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '../hooks/useAuth';
import { useCartCount } from '../hooks/useCart';
import { Gem, Search, ShoppingBag, UserCircle, X, Menu as MenuIcon, MapPin, Phone, Mail, Share, ThumbsUp, Heart } from 'lucide-react';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const { isAuthenticated } = useIsAuthenticated();
    const cartCount = useCartCount();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-[#28392e] bg-background-dark/95 backdrop-blur-sm px-4 lg:px-10 py-3">
                <div className="flex items-center justify-between mx-auto max-w-350">
                    <div className="flex items-center gap-4 lg:gap-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 text-secondary">
                            <Gem size={32} className="text-secondary" />
                            <h1 className="text-secondary text-xl font-bold tracking-tight hidden md:block">
                                <span className="text-white font-light">Jalaram</span> Wedding <span className="text-white font-light">Couture</span>
                            </h1>
                        </Link>

                        {/* Desktop Menu */}
                        <nav className="hidden lg:flex items-center gap-8 ml-8">
                            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-secondary' : 'text-white/80 hover:text-secondary'}`}>Home</Link>
                            <Link to="/Products" className={`text-sm font-medium transition-colors ${isActive('/Products') ? 'text-secondary' : 'text-white/80 hover:text-secondary'}`}>Products</Link>
                            <Link to="/new-arrivals" className={`text-sm font-medium transition-colors ${isActive('/new-arrivals') ? 'text-secondary' : 'text-white/80 hover:text-secondary'}`}>New Arrivals</Link>
                            <Link to="/about-us" className={`text-sm font-medium transition-colors ${isActive('/about-us') ? 'text-secondary' : 'text-white/80 hover:text-secondary'}`}>About Us</Link>
                            <Link to="/contact-us" className={`text-sm font-medium transition-colors ${isActive('/contact-us') ? 'text-secondary' : 'text-white/80 hover:text-secondary'}`}>Contact Us</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Icons */}
                        <div className="flex items-center gap-3">
                            <Link to="/cart" className="relative flex items-center justify-center size-10 rounded-full hover:bg-[#28392e] text-white transition-colors">
                                <ShoppingBag />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-[#0f1c15] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            {isAuthenticated && (
                                <Link to="/profile?tab=wishlist" className="flex items-center justify-center size-10 rounded-full hover:bg-[#28392e] text-white transition-colors">
                                    <Heart />
                                </Link>
                            )}
                            <Link to={isAuthenticated ? '/profile' : '/login'} className="flex items-center justify-center size-10 rounded-full hover:bg-[#28392e] text-white transition-colors">
                                <UserCircle />
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden flex items-center justify-center size-10 rounded-full hover:bg-[#28392e] text-white transition-colors"
                            >
                                {mobileMenuOpen ? <X /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-70 bg-background-dark border-l border-[#28392e] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-[#28392e]">
                                <div className="flex items-center gap-3 text-secondary">
                                    <Gem size={28} className="text-secondary" />
                                    <h2 className="text-secondary text-lg font-bold">JWC</h2>
                                </div>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-6">
                                <div className="flex flex-col gap-4">
                                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium transition-colors py-2 ${isActive('/') ? 'text-secondary' : 'text-white hover:text-secondary'}`}>Home</Link>
                                    <Link to="/Products" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium transition-colors py-2 ${isActive('/Products') ? 'text-secondary' : 'text-white hover:text-secondary'}`}>Products</Link>
                                    <Link to="/new-arrivals" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium transition-colors py-2 ${isActive('/new-arrivals') ? 'text-secondary' : 'text-white hover:text-secondary'}`}>New Arrivals</Link>
                                    <Link to="/about-us" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium transition-colors py-2 ${isActive('/about-us') ? 'text-secondary' : 'text-white hover:text-secondary'}`}>About Us</Link>
                                    <Link to="/contact-us" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium transition-colors py-2 ${isActive('/contact-us') ? 'text-secondary' : 'text-white hover:text-secondary'}`}>Contact Us</Link>
                                </div>
                            </nav>
                            <div className="p-6 border-t border-[#28392e]">
                                <div className="flex items-center bg-[#28392e] rounded-full px-3 py-2 border border-transparent focus-within:border-secondary transition-colors">
                                    <Search size={18} className="text-[#9db9a6]" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-[#9db9a6] w-full py-1 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const Footer = () => {
    return (
        <footer className="bg-[#0b180f] border-t border-[#28392e] pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 text-secondary mb-4">
                            <Gem className="w-5 h-5" />
                            <span className="text-lg font-bold">Jalaram Wedding Couture</span>
                        </div>
                        <p className="text-white/50 text-sm font-body leading-relaxed">
                            Crafting memories with threads of tradition since 1999. We bring you the finest ethnic wear for your special occasions.
                        </p>
                    </div>

                    {/* Shop */}

                    {/* Help */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Help</h4>
                        <ul className="space-y-2 text-sm text-white/60 font-body">
                            <li><Link to="#" className="hover:text-primary transition-colors">Track Order</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Size Guide</Link></li>
                            <li><Link to="/about-us" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/contact-us" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm text-white/60 font-body">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-lg" />
                                <span>Dr Yagnik Rd, beside Ishwarbhai,Ghughrawala<br /> commissioner garden, Ram Krishna,<br/>Nagar, Rama Krishan Nagar, Rajkot, Gujarat 360001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-lg" />
                                <span>+91 99987 17666</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-white/60 flex-shrink-0" />
                                <span>jalaramweddingcouture8789@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#28392e] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs font-body">© {new Date().getFullYear()} Jalaram Wedding Couture. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const WhatsAppButton = () => {
    const phoneNumber = '919998717666';
    const prefilledMessage = 'Hi! I want to know more about Jalaram Wedding Couture.';
    const chatUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefilledMessage)}`;

    return (
        <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-[#0b160e] font-semibold shadow-xl shadow-[#25D366]/40 transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#25D366]/70"
            aria-label="Chat with us on WhatsApp"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="22"
                height="22"
                aria-hidden="true"
            >
                <path
                    fill="currentColor"
                    d="M16 0C7.164 0 0 7.163 0 16c0 2.819.736 5.573 2.129 7.988L0 32l8.168-2.129A15.9 15.9 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.223 22.613c-.349.979-2.02 1.885-2.799 2-.78.115-1.697.163-2.735-.177-.633-.2-1.445-.471-2.492-.92-4.39-1.898-7.257-6.339-7.48-6.642-.223-.303-1.788-2.382-1.788-4.547 0-2.165 1.117-3.233 1.511-3.682.394-.449.862-.561 1.15-.561.288 0 .575.003.829.015.266.013.622-.1.973.742.349.843 1.188 2.91 1.29 3.124.102.214.171.466.034.768-.137.303-.205.465-.401.716-.196.251-.412.561-.588.754-.196.214-.401.45-.173.854.228.403 1.012 1.665 2.175 2.699 1.494 1.333 2.748 1.744 3.151 1.951.403.206.639.172.877-.103.237-.274 1.011-1.177 1.279-1.58.268-.404.537-.337.906-.201.368.137 2.335 1.099 2.732 1.299.397.2.661.3.758.468.097.167.097.966-.252 1.944z"
                />
            </svg>
            <span className="hidden sm:inline">Chat with us</span>
        </a>
    );
};

const Layout = () => {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div
            className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-[#111813] dark:text-white font-display overflow-x-hidden antialiased"
            style={{ backgroundColor: '#102216', minHeight: '100vh' }}
        >
            <Header />
            <main className="grow">
                <Outlet />
            </main>
            <WhatsAppButton />
            <Footer />
        </div>
    );
};

export default Layout;
