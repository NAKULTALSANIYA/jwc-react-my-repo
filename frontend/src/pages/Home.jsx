import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Gem, Truck, ShieldCheck, ArrowRight, MoveRight, ShoppingCart } from 'lucide-react';

const Home = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative w-full h-[600px] md:h-[700px] bg-background-dark overflow-hidden group">
                <div className="absolute inset-0 z-0">
                    <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-105"
                        data-alt="Elegant Indian couple in wedding attire gold and green theme"
                        style={{ backgroundImage: "linear-gradient(to bottom, rgba(16, 34, 22, 0.3), rgba(16, 34, 22, 0.9)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuWS_3oHOklQD8Xfn3masRqcQG4f4NO1tdebSMKyNE_9MwkeEjmELs4yoIklNbRdbp63Q3Ud39KZOaWjHb7wtsJ9qiV6aZnN-vMJ_y3OZPduFb04M9KLTBybOPHMBA-dmPZGq5yU-BX-WzxsC_i2DpIby4gUtlNJAfWxdovzcI9RVjRoqv4rZ-TkfweSVv1e7ktOkbzajr40Rvi6v1e3HE-C7UwtDFF9Xjn2zqpMIasdg9U8yx2gYtiSN3gOyMJJPeM2zGqUjQWaxE')" }}
                    >
                    </div>
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center max-w-4xl mx-auto animate-fade-in-up">
                    <span className="text-secondary tracking-[0.2em] uppercase text-sm md:text-base font-medium mb-4 animate-fade-in-up">Heritage & Luxury</span>
                    <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 drop-shadow-lg">
                        Elegance Woven <br /> <span className="italic font-light text-[#9db9a6]">in Tradition</span>
                    </h1>
                    <p className="text-white/90 text-base md:text-lg max-w-xl mb-10 font-light font-body">
                        Discover handcrafted Sherwanis and Lehengas designed for your most cherished moments. Embrace the golden era of fashion.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/collection" className="bg-primary text-background-dark hover:bg-white hover:text-background-dark px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(17,212,82,0.3)]">
                            Explore Collection
                        </Link>
                        <button className="border border-white/30 hover:border-secondary hover:text-secondary text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 backdrop-blur-sm">
                            Book Appointment
                        </button>
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <div className="bg-surface-dark py-8 border-y border-[#28392e]">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Shirt className="text-secondary w-8 h-8" />
                        <span className="text-white text-sm font-medium">Custom Tailoring</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Gem className="text-secondary w-8 h-8" />
                        <span className="text-white text-sm font-medium">Premium Fabric</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Truck className="text-secondary w-8 h-8" />
                        <span className="text-white text-sm font-medium">Global Shipping</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="text-secondary w-8 h-8" />
                        <span className="text-white text-sm font-medium">Authentic Design</span>
                    </div>
                </div>
            </div>

            {/* Shop By Category */}
            <section className="py-16 md:py-24 px-4 md:px-10 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-white text-3xl md:text-4xl font-bold">Curated <span className="text-secondary italic">Categories</span></h2>
                    <Link to="/collection" className="text-primary hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <Link to="/products" className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-xl cursor-pointer">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            data-alt="Groom wearing golden sherwani"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6gvJ3mF4qGeDRW2TEUgBYzo2iFUVIM-ex8OJJcRymLnK_MD4sqydXqzo3Lpi97pOAbgZPTVKT9R2Iuy2gdeQmWGEHyU6AURMTmqf16F5MB46kxG6prcVWzAvH0hApWGJtiLHDIhsjGcNFG6pRYYT0NfxtVSgC00jq0Fwh5IYltF7X5LAKcxoMjvW7JfabFDBlHAHTCWXVWUkQ2jl49EI7MI7W1bZu1arx7wkalu70UbnnnjQ_rIocCQFZ_JQ5Eu8VySU4DPMDbIg2')" }}
                        >
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-white text-2xl font-bold mb-2 font-display">The Royal Groom</h3>
                            <p className="text-white/70 text-sm mb-4 font-body line-clamp-2">Exquisite Sherwanis crafted with intricate embroidery for your big day.</p>
                            <span className="inline-flex items-center text-secondary text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                Shop Men
                                <MoveRight className="ml-1 w-5 h-5" />
                            </span>
                        </div>
                    </Link>
                    {/* Card 2 */}
                    <Link to="/collection" className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-xl cursor-pointer md:-mt-8">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            data-alt="Bride wearing red and gold lehenga"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJ8gYwlydlMbonHTe69RxHJfArQtbHKuSRT3HkGUYtbeOU-TxQv6Of71IdJTOWOKikHc4nurHkwSzj8WYC6iQ2eWfmfUoXLk19FB5erEt0qHhGDBUrY6Je-VhYQmgUejlV5P-Jqz47QrQpJZW9lcuDGIg8MBQW380aAEYUMifEklPG63ZOQTs9EZUWcsJzd2uxVb9wPOyimnUSBjg6UFftad9Vd5vxeO4FmyOlA0KEpIe6MIQxBgeIp2mVZHhb_iCV7sVO0lZIgKD1')" }}
                        >
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-white text-2xl font-bold mb-2 font-display">The Radiant Bride</h3>
                            <p className="text-white/70 text-sm mb-4 font-body line-clamp-2">Timeless Lehengas that blend tradition with contemporary elegance.</p>
                            <span className="inline-flex items-center text-secondary text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                Shop Women
                                <MoveRight className="ml-1 w-5 h-5" />
                            </span>
                        </div>
                    </Link>
                    {/* Card 3 */}
                    <Link to="/collection" className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-xl cursor-pointer">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            data-alt="Close up of luxury indian fabric patterns"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCx2o8DNHr6rlBauLEejAcL6VeSdftpAkVUm9Yhhvnb2m9xVvlittzseGpUfNX5wqmFcgA1E2n7ltcqOuRL58sokHIFpDdDeA_MSDQqdf0SdMDSBgRDjpEoAqaQskZMN4_hy89zHSc4ummH_-Hy-QPHAZW5_QXA6Zyb3j8xl9cNB5JJa_6G1tYXqZs83BoeWkiSRGBis3RpckAEIMgth5mMz6Ah_Mzl9A6umUd7ZcptCqrTXAsw00SGAg4YIpfrV_p7AaN5am0wo5P_')" }}
                        >
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-white text-2xl font-bold mb-2 font-display">Accessories & More</h3>
                            <p className="text-white/70 text-sm mb-4 font-body line-clamp-2">Complete your look with our curated collection of ethnic accessories.</p>
                            <span className="inline-flex items-center text-secondary text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                Explore
                                <MoveRight className="ml-1 w-5 h-5" />
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-12 bg-surface-dark w-full">
                <div className="px-4 md:px-10 max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Fresh off the loom</span>
                        <h2 className="text-white text-3xl md:text-4xl font-bold">New Arrivals</h2>
                        <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {/* Product 1 */}
                        <div className="group flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                                <img alt="Emerald Silk Kurta" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcmlNIfurHW1G8sYYQmyvmqCQg6Yote8Qhezo4MiMM6B5xhZPXk2ZvFmSEZzL2YVQiI9QIfaPempVM7BDX-lIQp46LrFWQ9pMhQ0ogCMtlEwZPIZxbWkhzSWPa0HyVk3AKOyeIm7gp2VwrdxQz5n79un5Zlblm_A5xkud7EU_E3ti8MmA-Ziv2GTt5S1MYXF2KE0mYFpmShKRjs9ErsdCNwdwFSpg2XqJV9HiOp2hGV7zRLWz-4ingZ_WI1LHkQd8py68CxtbmXEBX" />
                                <button className="absolute bottom-3 right-3 bg-white text-background-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                                <span className="absolute top-3 left-3 bg-secondary text-background-dark text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">New</span>
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-bold truncate">Emerald Silk Kurta</h3>
                                <p className="text-white/60 text-xs mb-2">Men's Ethnic Wear</p>
                                <p className="text-secondary font-bold">₹ 4,999</p>
                            </div>
                        </div>
                        {/* Product 2 */}
                        <div className="group flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                                <img alt="Golden Banarasi Saree" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVPXtF3Mt1cU9pDeCWSDkr2bMm0Z23Cm-CHUP8qNzolE-_QuG6lyigY6qUsErA4jtlVz9PA8Pik2JgNYQOM0uWeYs2l948_Glh1bEkgX0YEJ7jn_aoRGbTEVsYtGTAciQudkcGCgnsELaq9L-QJq0TFTOh4XAjwzjAfLE42U-2Xm0WCR6Lb4ycem6oQPmmNQ703UxR79I8grb25p3yGUETAYUST3k3MnFUkqhiv3Icr4EDDHFhqFp20EKpOn7N_tt3w_Q38rCvBE1D" />
                                <button className="absolute bottom-3 right-3 bg-white text-background-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-bold truncate">Golden Banarasi Saree</h3>
                                <p className="text-white/60 text-xs mb-2">Women's Saree</p>
                                <p className="text-secondary font-bold">₹ 12,499</p>
                            </div>
                        </div>
                        {/* Product 3 */}
                        <div className="group flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                                <img alt="Royal Velvet Sherwani" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNrXGVdvtlrQCudh7WNPKr5dFjEF100o125oA1jcXVy4hAkIQn_bJpPzB8efIln6nH7dzZxYyo6EQ5kyu6vPFY9T2eBUtMHq1b0gogxt2E-aKce-eVOQhUrSQ_Yyoo9EEJvC72InNE21mQucip7q0EOeP8mTSTwLNmetkg8Y_I1MNMs2ADtFh8xZnsvAIc0rHfVvIIM5igGdqTysNWwDBQWgA6z0Tnzdh-pnyXg3NoRFu7VytB4TnazQVwaJ8xBJw74xUZPyzmsj5E" />
                                <button className="absolute bottom-3 right-3 bg-white text-background-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-bold truncate">Royal Velvet Sherwani</h3>
                                <p className="text-white/60 text-xs mb-2">Groom Collection</p>
                                <p className="text-secondary font-bold">₹ 24,999</p>
                            </div>
                        </div>
                        {/* Product 4 */}
                        <div className="group flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                                <img alt="Rose Gold Lehenga" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWaCdYmz-1jTTwUitgQMMXa6QRo_3pZtAv--_D9uLeKVuYXa9tKb2dDJbYfTO6kQeopYEH98yX4jbw9ljYUBD5Zs6fHrSasFnhiNM4uCcF4WcMyGpqqrsFTCYrbyKejAiuSJYSOTp2_vp43IYBXYY4AhsdPAu1AY81L3E7FFmQWpaAHhDIoZ8kqIUqZlspOF7b3ShkXM8Aj9ABSaQIaK1HZmUJCHqQ7n3DuOzp3v0hROP4tbmbbY19WXwVa5NEh9GF10EfZ3qMRbO1" />
                                <button className="absolute bottom-3 right-3 bg-white text-background-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-bold truncate">Rose Gold Lehenga</h3>
                                <p className="text-white/60 text-xs mb-2">Bridal Collection</p>
                                <p className="text-secondary font-bold">₹ 35,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 px-4 relative overflow-hidden">
                <div
                    className="absolute inset-0 z-0 opacity-10"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsElhq1KFUjuk7VxkqX8z1ukpgMplnsSPKhlm8OLdGVM3wSVti5GohagZNcPfTM2RGrRHcjBjnvTgM5fcEUg1x3WDoq7QZ5a4w_kBuHLVwPC2XBSx978e3tc0e9HErx2jBbgx2tvbTsbx1fvUe10cRdSNrh56N8NSL--i2bBYpJPP2_JMhMV4-Hd471rLdgSAiHbdQ3QQboC-NExub86N-0v8-V4gS92uJ3L6S_OP2NO9ksjlhPxvMKOEF5pEqvAhoWFuoPdqPkTSf')" }}
                >
                </div>
                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Join the Jalaram Family</h2>
                    <p className="text-white/70 mb-8 font-body">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 bg-surface-dark border border-[#28392e] text-white px-6 py-3 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary placeholder:text-white/30"
                        />
                        <button type="submit" className="bg-secondary hover:bg-white hover:text-background-dark text-background-dark font-bold py-3 px-8 rounded-lg transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
};

export default Home;
