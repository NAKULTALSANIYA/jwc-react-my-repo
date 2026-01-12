import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';

const newArrivals = [
    {
        id: 1,
        name: "Emerald Silk Kurta",
        price: 4999,
        category: "Men's Ethnic Wear",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcmlNIfurHW1G8sYYQmyvmqCQg6Yote8Qhezo4MiMM6B5xhZPXk2ZvFmSEZzL2YVQiI9QIfaPempVM7BDX-lIQp46LrFWQ9pMhQ0ogCMtlEwZPIZxbWkhzSWPa0HyVk3AKOyeIm7gp2VwrdxQz5n79un5Zlblm_A5xkud7EU_E3ti8MmA-Ziv2GTt5S1MYXF2KE0mYFpmShKRjs9ErsdCNwdwFSpg2XqJV9HiOp2hGV7zRLWz-4ingZ_WI1LHkQd8py68CxtbmXEBX",
        badge: "New"
    },
    {
        id: 2,
        name: "Golden Banarasi Saree",
        price: 12499,
        category: "Women's Saree",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVPXtF3Mt1cU9pDeCWSDkr2bMm0Z23Cm-CHUP8qNzolE-_QuG6lyigY6qUsErA4jtlVz9PA8Pik2JgNYQOM0uWeYs2l948_Glh1bEkgX0YEJ7jn_aoRGbTEVsYtGTAciQudkcGCgnsELaq9L-QJq0TFTOh4XAjwzjAfLE42U-2Xm0WCR6Lb4ycem6oQPmmNQ703UxR79I8grb25p3yGUETAYUST3k3MnFUkqhiv3Icr4EDDHFhqFp20EKpOn7N_tt3w_Q38rCvBE1D",
        badge: "New"
    },
    {
        id: 3,
        name: "Royal Velvet Sherwani",
        price: 24999,
        category: "Groom Collection",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNrXGVdvtlrQCudh7WNPKr5dFjEF100o125oA1jcXVy4hAkIQn_bJpPzB8efIln6nH7dzZxYyo6EQ5kyu6vPFY9T2eBUtMHq1b0gogxt2E-aKce-eVOQhUrSQ_Yyoo9EEJvC72InNE21mQucip7q0EOeP8mTSTwLNmetkg8Y_I1MNMs2ADtFh8xZnsvAIc0rHfVvIIM5igGdqTysNWwDBQWgA6z0Tnzdh-pnyXg3NoRFu7VytB4TnazQVwaJ8xBJw74xUZPyzmsj5E",
        badge: "New"
    },
    {
        id: 4,
        name: "Rose Gold Lehenga",
        price: 35000,
        category: "Bridal Collection",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWaCdYmz-1jTTwUitgQMMXa6QRo_3pZtAv--_D9uLeKVuYXa9tKb2dDJbYfTO6kQeopYEH98yX4jbw9ljYUBD5Zs6fHrSasFnhiNM4uCcF4WcMyGpqqrsFTCYrbyKejAiuSJYSOTp2_vp43IYBXYY4AhsdPAu1AY81L3E7FFmQWpaAHhDIoZ8kqIUqZlspOF7b3ShkXM8Aj9ABSaQIaK1HZmUJCHqQ7n3DuOzp3v0hROP4tbmbbY19WXwVa5NEh9GF10EfZ3qMRbO1",
        badge: "New"
    },
    {
        id: 5,
        name: "Navy Blue Bandhgala",
        price: 15500,
        category: "Indo-Western",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB4N7rdt4vs4MYmLVlKOaPXonyg7BUD-4VVP6TWkZp4YX3YraQyMs757PVasoLPGXv0gMKysIx4Z39xldmYyqmPx6hpqAv2wOEMZmAH8j5vZS_WsNFAUlq_bC7b_OcB2o3PrO_JzlXWFe_v6xeXp-zJe4DMi8vZk282iviVdFKtRSADY36q6tTYFnFKUcNwIaTfkz9SPWaNO7tkHAl00xNYoQifFXP4_qzOHcaKla87AkbjL5bTUgkEBoJ5HVwszB_gZz3PzHtAtj5",
        badge: "Trending"
    },
    {
        id: 6,
        name: "Maroon Jodhpuri Set",
        price: 21000,
        originalPrice: 25000,
        category: "Indo-Western",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgkz2l6ukvGDxLhrFNpLSG7_oWj1ReJO97mtNS6qscCwBFXWW_WiXCzvyGTxOUhIjHN5DXqMuvAHFghfgwkSqLi1996hVjmn3-cZrGPSrQrN5TqW-4X5tvspVHpKnbMwHXLNqSeaKMOBW468W9LNOEC-2waKKdR1GBiu_tVSygZl6jAMg-eptWcl6cu6PI-Bzbi9C90_DgIHcSji12ZcEgib-PnTHcRLpqkLOje72tmsR0Bff2xQb2Tju_DPtl7D0Y6Q8mDtLkUHbt",
        badge: "Sale"
    }
];

const NewArrivals = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative w-full h-[300px] md:h-[400px] bg-background-dark overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "linear-gradient(to bottom, rgba(16, 34, 22, 0.7), rgba(16, 34, 22, 0.9)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsElhq1KFUjuk7VxkqX8z1ukpgMplnsSPKhlm8OLdGVM3wSVti5GohagZNcPfTM2RGrRHcjBjnvTgM5fcEUg1x3WDoq7QZ5a4w_kBuHLVwPC2XBSx978e3tc0e9HErx2jBbgx2tvbTsbx1fvUe10cRdSNrh56N8NSL--i2bBYpJPP2_JMhMV4-Hd471rLdgSAiHbdQ3QQboC-NExub86N-0v8-V4gS92uJ3L6S_OP2NO9ksjlhPxvMKOEF5pEqvAhoWFuoPdqPkTSf')"
                    }}
                ></div>
                <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-12 animate-fade-in-up">
                    <p className="text-secondary uppercase tracking-widest text-xs font-sans font-bold mb-2">Fresh Arrivals 2024</p>
                    <h1 className="text-white text-4xl md:text-6xl font-bold font-display">New Arrivals</h1>
                    <p className="text-[#9db9a6] text-base md:text-lg mt-3 max-w-2xl">Discover our latest collection of handcrafted ethnic wear, designed to make your special moments unforgettable.</p>
                </div>
            </div>

            {/* Products Grid */}
            <section className="py-16 px-4 md:px-10 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-white text-2xl md:text-3xl font-bold">Latest Collection</h2>
                        <p className="text-[#9db9a6] text-sm mt-1">{newArrivals.length} new items</p>
                    </div>
                    <Link to="/products" className="text-primary hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {newArrivals.map(product => (
                        <div key={product.id} className="group flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-surface-dark border border-[#28392e] hover:border-secondary/50 transition-all">
                                <img
                                    alt={product.name}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                    src={product.image}
                                />
                                <button className="absolute bottom-3 right-3 size-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary hover:text-black transition-colors opacity-0 group-hover:opacity-100">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                                {product.badge && (
                                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${product.badge === "New" ? "bg-secondary text-black" :
                                        product.badge === "Sale" ? "bg-red-600 text-white" :
                                            "bg-primary text-black"
                                        }`}>
                                        {product.badge}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-white text-base md:text-lg font-bold truncate group-hover:text-primary transition-colors">{product.name}</h3>
                                <p className="text-[#9db9a6] text-xs mb-2">{product.category}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-secondary font-bold text-base md:text-lg">₹{product.price.toLocaleString()}</p>
                                    {product.originalPrice && (
                                        <p className="text-gray-500 text-xs line-through">₹{product.originalPrice.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-surface-dark border-y border-[#28392e]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl text-white font-display font-bold mb-4">
                        Looking for Something Specific?
                    </h2>
                    <p className="text-[#9db9a6] text-base md:text-lg mb-8 max-w-2xl mx-auto">
                        Browse our complete collection or book a personalized consultation with our styling experts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/collection" className="bg-primary hover:bg-white hover:text-background-dark text-background-dark px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(17,212,82,0.3)]">
                            Browse All Collections
                        </Link>
                        <button className="border border-white/30 hover:border-secondary hover:text-secondary text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 backdrop-blur-sm">
                            Book Appointment
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NewArrivals;
