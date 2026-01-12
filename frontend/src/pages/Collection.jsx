import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const Collection = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-[40vh] flex items-center justify-center bg-surface-dark overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10"></div>
                    <img alt="Close up detail of luxurious Indian wedding embroidery with golden threads" className="w-full h-full object-cover opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDfnZC8CYIOxxrWzXaSL_hHoRbpJvp2SEL4czK_zMKVZvt2iuNCvFPq7IXkAbS-jPsbfF1ybfQrhLIJ598nkNFtIG-yDdD8LtgRyZEKuehviP-RPaiXGMfXkqbKZQ4fEQBpWDQP6CSr_j7XFNH3Eq7vDBwwoWjGtB7b32eG7SCPv8dBmzDDwQiVdjTlUY-ifVcd4elIUQOAMdzF6OabWzpIniIDgJwXTfqqnDqmk57I67EQP0mDxoTDEegdWnc0ysEZu9pNT4rSF2r" />
                </div>
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-4 animate-fade-in-up">
                    <div className="inline-block px-3 py-1 border border-secondary/30 rounded-full bg-black/20 backdrop-blur-sm mb-2">
                        <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase">Est. 1990</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
                        Curated <span className="italic text-secondary">Collections</span>
                    </h1>
                    <p className="text-[#9db9a6] text-lg font-light max-w-xl mx-auto font-display">
                        Explore our finest selection of ethnic wear, handcrafted to bring timeless elegance to your special moments.
                    </p>
                </div>
            </section>

            {/* Main Categories Grid */}
            <section className="px-4 md:px-10 lg:px-40 py-16 bg-background-dark">
                <div className="flex items-end justify-between mb-8 gold-border-bottom pb-4">
                    <div>
                        <h3 className="text-secondary text-sm font-bold tracking-widest uppercase mb-1">Browse by Category</h3>
                        <h2 className="text-3xl text-white font-display">Our Signature Lines</h2>
                    </div>
                    <Link to="/products" className="hidden md:flex items-center gap-2 text-[#9db9a6] hover:text-primary transition-colors text-sm font-medium group">
                        View All Products
                        <ArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                    {/* Category Card 1: Men's Sherwani (Large Feature) */}
                    <Link to="/products" className="group relative rounded-xl overflow-hidden cursor-pointer md:col-span-2 lg:col-span-1 border border-white/5 shadow-lg shadow-black/40">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8wOshfG9LyRqLaDiNvRP654eSQppjo6ln8XnSHLFGVkTQJFuVktFalO7qCO2n3nnmWQpzlxchC6f8tcrtJ_jiv36LwaaTzpOC76ZR131pgdtmBqxOsxosULH2U29b9Mz4bzGfwkYJ9bDJhazjDVo9Va_DyvhRf7qv__XusnPS_r09OX9D-Bq54j3WTg38NtzOJuCW_HQf6RY7yzubtZh3pICYW2PY4m4ZQ21jk3x-r3dYtbNZNgOuv4ovQPE8lZyp0lkV8bDpID0u')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">For Him</span>
                            <h3 className="text-3xl text-white font-display font-bold mb-2">Royal Sherwanis</h3>
                            <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                Exquisite craftsmanship featuring intricate zardosi work fit for royalty.
                            </p>
                            <button className="flex items-center gap-2 text-secondary text-sm font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                                Explore Collection <ArrowUpRight className="text-sm" />
                            </button>
                        </div>
                    </Link>
                    {/* Category Card 2: Women's Lehenga */}
                    <Link to="/collection" className="group relative rounded-xl overflow-hidden cursor-pointer lg:col-span-2 border border-white/5 shadow-lg shadow-black/40">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjOrLkilA5oDftEDWBL0smpuAfyIJpzshj8hWn4eEjl2jHztfZlNbfvjMrEUFyiWoSSQZH0-O1VFhhZR8896LsbDw9KlyCD_a-Sze0lG7FgWkDXzAkqhFlEkcrcwFNUHU-DuLuR6lLffO2ffyoR_jst_3Yj97Hw8W5fLf5py-jSRAnZVeQnvQ1tOgTWCUET-Cwho2d0N6O1sqFL2oclKFpV8MbWpYVxuwIU-Cjr0PIXE2_ZI7D-Z6l53JHqPKy_J4Fk8e5kYTVdped')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col items-start">
                            <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">For Her</span>
                            <h3 className="text-3xl text-white font-display font-bold mb-2">Bridal Lehengas</h3>
                            <p className="text-gray-300 text-sm max-w-md opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                Handcrafted masterpieces that weave tradition with contemporary grace.
                            </p>
                            <button className="flex items-center gap-2 text-secondary text-sm font-bold uppercase tracking-wider group-hover:text-white transition-colors mt-2">
                                Explore Collection <ArrowUpRight className="text-sm" />
                            </button>
                        </div>
                    </Link>
                    {/* Category Card 3: Men's Kurta */}
                    <Link to="/products" className="group relative rounded-xl overflow-hidden cursor-pointer border border-white/5 shadow-lg shadow-black/40">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhE1O0Ml00j34BaWVsM_oUSawdC8WAo0N-rBzMzM0M3iiA7xR8oPRxk5GC2w2zgkmYPqmXpOhzzIozm9swsSrxBDHlv_6rtn0TmmwEIjHbkX4fv-5Z6vIxu9VJNU4C1fyI1dHE45kss-GMF5RGK1_Scsr3nBWNtneusfOprop2nlvoPwv_AB4uIcdbNLZ3LpCvcZjYK5Hgz9XwNl4utVV1Ziwtcr_LK438QDjmzJUmf0MAG7beXAHOALO6Y0klUdZ5TYQBQNl9mbGr')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-2xl text-white font-display font-bold mb-1">Classic Kurtas</h3>
                            <p className="text-[#9db9a6] text-xs mb-3">Festive & Casual Wear</p>
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    {/* Category Card 4: Women's Saree */}
                    <Link to="/collection" className="group relative rounded-xl overflow-hidden cursor-pointer border border-white/5 shadow-lg shadow-black/40">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDmEEzmWcY8Cya_KFFBGS5Y_dNjsQg7w14cTFbBPFQdxt3nzDClgSy87WDcwFqsvFokebkLbwqVb9sbKPiUFbIVDlcksgmcXSwZifhH2HJ1pZqBP7cm1Svc7K61NUSy51as0tnlTjBuo_Tk9BStfdnDprTdYOYxTVoQsJVL4ELnc9haznfo4_7aL3xfjbVaOe-ltl_1zGBSlPx8X71afu0A0iKfeTRlPyBHF9D3fBHhrJlDI_rWmAI3Lw3PA44o8phy16WOxspLh1MW')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-2xl text-white font-display font-bold mb-1">Silk Sarees</h3>
                            <p className="text-[#9db9a6] text-xs mb-3">Timeless Elegance</p>
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    {/* Category Card 5: Accessories */}
                    <div className="group relative rounded-xl overflow-hidden cursor-pointer border border-white/5 shadow-lg shadow-black/40">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6ORz8SCMdDyCpyxUiFMab1hoPFUAp-_UOqFn6ICgcEDM2VsekeCblKqVqW18cQ_OeZ1KLSMiWExsdDrhW2dHTKU1_l-pK_FnJLPTD35Z3lmjQebjB5yKURzfkTAVVWQjgWTkyr05m7TIXapVDZVH287u0SOheQNE6wOoWO93bXmg7T_3xTxtzy3Bg0L4xMDqhqwoG2CscRue5BC0T4Upy9bw9iU5XyzJ7poPKeLPn7G42X59jRNiMCGCilzcZL51nISHiRzJRu9jm')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-2xl text-white font-display font-bold mb-1">Accessories</h3>
                            <p className="text-[#9db9a6] text-xs mb-3">Jewelry, Safas & More</p>
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seasonal Spotlight / Horizontal Card */}
            <section className="px-4 md:px-10 lg:px-40 py-10 bg-surface-dark border-y border-[#28392e]">
                <div className="relative rounded-2xl overflow-hidden bg-[#1c271f] shadow-2xl">
                    <div className="grid lg:grid-cols-2">
                        <div className="relative h-64 lg:h-auto overflow-hidden">
                            <img alt="Couple in matching ethnic outfits holding hands" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjkxnWAXB9rERWiK7_oiDY21V2mRVUt5O3XNqy_qVG1vxNz6JSce15-OReRI-aSAamvvtzbiATIBnBDZuTc0VmkpBgLLbeND3vGLNh5ZyQAmlRRPKkg62orTh7U8W45KBGy0Ub4Gshal9zrEzxISVk-K0t4gMROk1x_Xk1wbkJ9IIfmCm9JXoDSIuMnirmrTu30GEEO387AbaE7qOFo_TBLhjHeocakMcPotm26LmVd1oDd6h3IXC_HFhZrSBszjxjCSIMDd7UwTAy" />
                            {/* Badge */}
                            <div className="absolute top-4 left-4 bg-primary text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                SEASONAL SPOTLIGHT
                            </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center items-start gap-6">
                            <h2 className="text-3xl md:text-4xl text-white font-display font-bold leading-tight">
                                The <span className="text-secondary">Golden</span> Era Collection
                            </h2>
                            <p className="text-[#9db9a6] text-base font-light leading-relaxed">
                                Step into a world where tradition meets modern luxury. Our latest seasonal collection features hand-woven Banarasi silks, intricate zari embroidery, and a palette inspired by royal courts. Perfect for the wedding season.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <button className="bg-primary hover:bg-green-400 text-black text-sm font-bold py-3 px-8 rounded-lg shadow-lg shadow-green-900/20 transition-all transform hover:scale-105">
                                    Shop Seasonal
                                </button>
                                <button className="border border-secondary/50 text-secondary hover:bg-secondary hover:text-black text-sm font-bold py-3 px-8 rounded-lg transition-all">
                                    View Lookbook
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Collection;
