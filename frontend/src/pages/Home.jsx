    import React, { useState, useEffect, useRef, useCallback } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Shirt, Gem, Truck, ShieldCheck, ArrowRight, MoveRight, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
    import VideoModal from '../components/VideoModal';
    import { getVideos } from '../api/services/video.service';
    import { getHomeOccasions, getWomenCategories, getAccessoriesCategories } from '../api/services/occasion.service';

    const Home = () => {
        const navigate = useNavigate();
        const [videos, setVideos] = useState([]);
        const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [selectedVideo, setSelectedVideo] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);
        const scrollContainerRef = useRef(null);

        // Normalize media URLs so relative '/uploads/..' paths work on the frontend origin
        const buildMediaUrl = useCallback((url) => {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            const rawBase = import.meta.env.VITE_API_URL || '';
            const baseNoSlash = rawBase.replace(/\/$/, '');
            const base = baseNoSlash.replace(/\/api$/, ''); // strip trailing /api to avoid /api/uploads
            const needsSlash = url.startsWith('/') ? '' : '/';
            return `${base}${needsSlash}${url}`;
        }, []);

        // Occasion Categories
        const [categories, setCategories] = useState([]);
        const [categoriesLoading, setCategoriesLoading] = useState(false);
        const categoryScrollRef = useRef(null);
        const categoryAutoScrollRef = useRef(null);

        // Women Categories
        const [womenCategories, setWomenCategories] = useState([]);
        const [womenLoading, setWomenLoading] = useState(false);
        const womenScrollRef = useRef(null);

        // Accessories Categories
        const [accessoriesCategories, setAccessoriesCategories] = useState([]);
        const [accessoriesLoading, setAccessoriesLoading] = useState(false);
        const accessoriesScrollRef = useRef(null);

        // Hero slider touch/mouse tracking
        const heroSectionRef = useRef(null);
        const heroTouchStartRef = useRef({ x: 0, y: 0 });
        const heroMouseStartRef = useRef({ x: 0, y: 0 });

        // Hero slider: images + autoplay + manual controls
        const heroSlides = [
            // Royal Velvet Sherwani (men's statement look)
            {
                image:
                    'https://images.unsplash.com/photo-1634410251313-b65c51944ab3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZXRobmljJTIwd2VhciUyMG1vZGVsfGVufDB8fDB8fHww',
            },
            // Rose Gold Lehenga (bridal elegance)
            {
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAWaCdYmz-1jTTwUitgQMMXa6QRo_3pZtAv--_D9uLeKVuYXa9tKb2dDJbYfTO6kQeopYEH98yX4jbw9ljYUBD5Zs6fHrSasFnhiNM4uCcF4WcMyGpqqrsFTCYrbyKejAiuSJYSOTp2_vp43IYBXYY4AhsdPAu1AY81L3E7FFmQWpaAHhDIoZ8kqIUqZlspOF7b3ShkXM8Aj9ABSaQIaK1HZmUJCHqQ7n3DuOzp3v0hROP4tbmbbY19WXwVa5NEh9GF10EfZ3qMRbO1',
            },
            // Emerald Silk Kurta (festive menswear)
            {
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCcmlNIfurHW1G8sYYQmyvmqCQg6Yote8Qhezo4MiMM6B5xhZPXk2ZvFmSEZzL2YVQiI9QIfaPempVM7BDX-lIQp46LrFWQ9pMhQ0ogCMtlEwZPIZxbWkhzSWPa0HyVk3AKOyeIm7gp2VwrdxQz5n79un5Zlblm_A5xkud7EU_E3ti8MmA-Ziv2GTt5S1MYXF2KE0mYFpmShKRjs9ErsdCNwdwFSpg2XqJV9HiOp2hGV7zRLWz-4ingZ_WI1LHkQd8py68CxtbmXEBX',
            },
            // Golden Banarasi Saree (heritage womenswear)
            {
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAVPXtF3Mt1cU9pDeCWSDkr2bMm0Z23Cm-CHUP8qNzolE-_QuG6lyigY6qUsErA4jtlVz9PA8Pik2JgNYQOM0uWeYs2l948_Glh1bEkgX0YEJ7jn_aoRGbTEVsYtGTAciQudkcGCgnsELaq9L-QJq0TFTOh4XAjwzjAfLE42U-2Xm0WCR6Lb4ycem6oQPmmNQ703UxR79I8grb25p3yGUETAYUST3k3MnFUkqhiv3Icr4EDDHFhqFp20EKpOn7N_tt3w_Q38rCvBE1D',
            },
        ];

        const [heroIndex, setHeroIndex] = useState(0);
        const [heroPaused, setHeroPaused] = useState(false);
        const heroTimerRef = useRef(null);

        useEffect(() => {
            if (heroPaused) return;
            heroTimerRef.current = setInterval(() => {
                setHeroIndex((i) => (i + 1) % heroSlides.length);
            }, 6000);
            return () => {
                if (heroTimerRef.current) clearInterval(heroTimerRef.current);
            };
        }, [heroPaused, heroSlides.length]);

        const prevHero = useCallback(
            () => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length),
            [heroSlides.length]
        );
        const nextHero = useCallback(
            () => setHeroIndex((i) => (i + 1) % heroSlides.length),
            [heroSlides.length]
        );

        // Keyboard navigation for hero
        useEffect(() => {
            const onKey = (e) => {
                if (e.key === 'ArrowLeft') prevHero();
                if (e.key === 'ArrowRight') nextHero();
            };
            window.addEventListener('keydown', onKey);
            return () => window.removeEventListener('keydown', onKey);
        }, [prevHero, nextHero]);

        // Touch swipe and mouse drag for hero slider
        useEffect(() => {
            const section = heroSectionRef.current;
            if (!section) return;

            // Touch events (for mobile/tablet)
            const handleTouchStart = (e) => {
                heroTouchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                setHeroPaused(true);
            };

            const handleTouchEnd = (e) => {
                const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
                const deltaX = touchEnd.x - heroTouchStartRef.current.x;
                const deltaY = Math.abs(touchEnd.y - heroTouchStartRef.current.y);

                // Only trigger swipe if horizontal movement is significant and vertical is small
                if (Math.abs(deltaX) > 50 && deltaY < 100) {
                    if (deltaX > 0) {
                        prevHero(); // Swipe right = previous slide
                    } else {
                        nextHero(); // Swipe left = next slide
                    }
                }
                setHeroPaused(false);
            };

            // Mouse drag events (for desktop)
            const handleMouseDown = (e) => {
                heroMouseStartRef.current = { x: e.clientX, y: e.clientY };
                setHeroPaused(true);
            };

            const handleMouseUp = (e) => {
                const mouseEnd = { x: e.clientX, y: e.clientY };
                const deltaX = mouseEnd.x - heroMouseStartRef.current.x;
                const deltaY = Math.abs(mouseEnd.y - heroMouseStartRef.current.y);

                // Only trigger drag if horizontal movement is significant
                if (Math.abs(deltaX) > 80 && deltaY < 100) {
                    if (deltaX > 0) {
                        prevHero(); // Drag right = previous slide
                    } else {
                        nextHero(); // Drag left = next slide
                    }
                }
                setHeroPaused(false);
            };

            section.addEventListener('touchstart', handleTouchStart);
            section.addEventListener('touchend', handleTouchEnd);
            section.addEventListener('mousedown', handleMouseDown);
            section.addEventListener('mouseup', handleMouseUp);

            return () => {
                section.removeEventListener('touchstart', handleTouchStart);
                section.removeEventListener('touchend', handleTouchEnd);
                section.removeEventListener('mousedown', handleMouseDown);
                section.removeEventListener('mouseup', handleMouseUp);
            };
        }, [prevHero, nextHero]);

        useEffect(() => {
            // Fetch categories for occasions
            const fetchCategories = async () => {
                try {
                    setCategoriesLoading(true);
                    const response = await getHomeOccasions();
                    if (response.success && response.data) {
                        // Response data structure: { data: { data: [...] } }
                        const occasionData = response.data.data || response.data;
                        setCategories(Array.isArray(occasionData) ? occasionData : []);
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    // Don't show error - categories are optional
                } finally {
                    setCategoriesLoading(false);
                }
            };
            fetchCategories();
        }, []);

        // Fetch women categories
        useEffect(() => {
            const fetchWomenCategories = async () => {
                try {
                    setWomenLoading(true);
                    const response = await getWomenCategories();
                    if (response.success && response.data) {
                        const womenData = response.data.data || response.data;
                        setWomenCategories(Array.isArray(womenData) ? womenData : []);
                    }
                } catch (error) {
                    console.error('Error fetching women categories:', error);
                } finally {
                    setWomenLoading(false);
                }
            };
            fetchWomenCategories();
        }, []);

        // Fetch accessories categories
        useEffect(() => {
            const fetchAccessoriesCategories = async () => {
                try {
                    setAccessoriesLoading(true);
                    const response = await getAccessoriesCategories();
                    if (response.success && response.data) {
                        const accessoriesData = response.data.data || response.data;
                        setAccessoriesCategories(Array.isArray(accessoriesData) ? accessoriesData : []);
                    }
                } catch (error) {
                    console.error('Error fetching accessories categories:', error);
                } finally {
                    setAccessoriesLoading(false);
                }
            };
            fetchAccessoriesCategories();
        }, []);

        // Auto-advance occasions slider by one full card for smooth, non-laggy scroll
        useEffect(() => {
            const container = categoryScrollRef.current;
            if (!container || categories.length === 0) return;

            const setup = () => {
                const scrollWidth = container.scrollWidth;
                const clientWidth = container.clientWidth;
                if (scrollWidth <= clientWidth) return () => {};

                const styles = getComputedStyle(container);
                const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
                const firstCard = container.querySelector('[data-occasion-card]');
                const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 280;
                const increment = Math.round(cardWidth + gap);

                const maxScrollLeft = scrollWidth - clientWidth;

                const advance = () => {
                    const next = container.scrollLeft + increment;
                    if (next >= maxScrollLeft - 4) {
                        container.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        container.scrollBy({ left: increment, behavior: 'smooth' });
                    }
                };

                // Start interval to advance per card
                categoryAutoScrollRef.current = setInterval(advance, 3500);

                const pause = () => categoryAutoScrollRef.current && clearInterval(categoryAutoScrollRef.current);
                const resume = () => {
                    pause();
                    categoryAutoScrollRef.current = setInterval(advance, 3500);
                };

                container.addEventListener('mouseenter', pause);
                container.addEventListener('mouseleave', resume);

                return () => {
                    pause();
                    container.removeEventListener('mouseenter', pause);
                    container.removeEventListener('mouseleave', resume);
                };
            };

            let cleanup = setup();
            // Recompute on resize to keep increments accurate
            const onResize = () => {
                cleanup && cleanup();
                cleanup = setup();
            };
            window.addEventListener('resize', onResize);

            return () => {
                cleanup && cleanup();
                window.removeEventListener('resize', onResize);
            };
        }, [categories.length]);

        useEffect(() => {
            // Fetch videos from the API
            const fetchVideos = async () => {
                try {
                    setIsLoading(true);
                    const response = await getVideos();
                    if (response.success && response.data) {
                        // Filter only active videos
                        const activeVideos = response.data.filter(video => video.isActive);
                        setVideos(activeVideos);
                    }
                } catch (error) {
                    console.error('Error fetching videos:', error);
                    setError('Failed to load videos');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchVideos();
        }, []);

        // Handle scroll to detect which video is in center
        useEffect(() => {
            if (scrollContainerRef.current && videos.length > 0) {
                const container = scrollContainerRef.current;
                
                const handleScroll = () => {
                    const containerRect = container.getBoundingClientRect();
                    const containerCenter = containerRect.left + containerRect.width / 2;
                    
                    let closestIndex = 0;
                    let closestDistance = Infinity;
                    
                    const cards = container.children;
                    Array.from(cards).forEach((card, index) => {
                        const cardRect = card.getBoundingClientRect();
                        const cardCenter = cardRect.left + cardRect.width / 2;
                        const distance = Math.abs(containerCenter - cardCenter);
                        
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestIndex = index;
                        }
                    });
                    
                    setCurrentVideoIndex(closestIndex);
                };
                
                container.addEventListener('scroll', handleScroll);
                // Initial check
                handleScroll();
                
                return () => container.removeEventListener('scroll', handleScroll);
            }
        }, [videos.length]);

        const openModal = (video) => {
            setSelectedVideo(video);
            setIsModalOpen(true);
        };

        const closeModal = () => {
            setIsModalOpen(false);
            setSelectedVideo(null);
        };

        const scrollLeft = () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({
                    left: -280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollRight = () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({
                    left: 280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollCategoryLeft = () => {
            if (categoryScrollRef.current) {
                categoryScrollRef.current.scrollBy({
                    left: -280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollCategoryRight = () => {
            if (categoryScrollRef.current) {
                categoryScrollRef.current.scrollBy({
                    left: 280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollWomenLeft = () => {
            if (womenScrollRef.current) {
                womenScrollRef.current.scrollBy({
                    left: -280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollWomenRight = () => {
            if (womenScrollRef.current) {
                womenScrollRef.current.scrollBy({
                    left: 280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollAccessoriesLeft = () => {
            if (accessoriesScrollRef.current) {
                accessoriesScrollRef.current.scrollBy({
                    left: -280,
                    behavior: 'smooth'
                });
            }
        };

        const scrollAccessoriesRight = () => {
            if (accessoriesScrollRef.current) {
                accessoriesScrollRef.current.scrollBy({
                    left: 280,
                    behavior: 'smooth'
                });
            }
        };

        const handleCategoryClick = (categoryId) => {
            // Navigate to products page with category filter
            navigate(`/products?category=${categoryId}`);
        };

        return (
            <>
                {/* Hero Section */}
                <section 
                    ref={heroSectionRef}
                    className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] bg-background-dark overflow-hidden group cursor-grab active:cursor-grabbing"
                >
                    {/* Slides background layer - Fixed positioning for proper coverage */}
                    <div
                        className="absolute inset-0 z-0"
                        onMouseEnter={() => setHeroPaused(true)}
                        onMouseLeave={() => setHeroPaused(false)}
                        aria-live="polite"
                    >
                        {heroSlides.map((s, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-opacity duration-700 bg-cover bg-center bg-no-repeat ${
                                    heroIndex === i ? 'opacity-100' : 'opacity-0'
                                }`}
                                style={{
                                    backgroundImage: `linear-gradient(to bottom, rgba(16,34,22,0.35), rgba(16,34,22,0.9)), url('${s.image}')`
                                }}
                            />
                        ))}
                    </div>

                    {/* Content overlay */}
                    <div className="relative z-10 flex flex-col items-start justify-center h-full px-4 md:px-10 text-left max-w-5xl mx-auto">
                        {/* <span className="text-secondary tracking-[0.2em] uppercase text-xs md:text-sm font-medium mb-3">Heritage & Luxury</span> */}
                        {heroSlides[heroIndex].headline && (
                            <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-lg">
                                {heroSlides[heroIndex].headline}
                            </h1>
                        )}
                        {heroSlides[heroIndex].sub && (
                            <p className="text-white/90 text-base md:text-lg max-w-xl mb-8 font-light font-body">
                                {heroSlides[heroIndex].sub}
                            </p>
                        )}
                        <div className="flex gap-4">
                            {/* <Link
                                to={heroSlides[heroIndex].link}
                                className="bg-primary text-background-dark hover:bg-white hover:text-background-dark px-7 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(17,212,82,0.3)]"
                            >
                                {heroSlides[heroIndex].cta}
                            </Link> */}
                        </div>

                        {/* Dots */}
                        {/* <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {heroSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goHero(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                        heroIndex === i ? 'bg-primary' : 'bg-white/40 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div> */}
                    </div>

                    {/* Arrows - Visible on all screens */}
                    <button
                        onClick={prevHero}
                        aria-label="Previous slide"
                        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/70 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        onClick={nextHero}
                        aria-label="Next slide"
                        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/70 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Slide indicators - visible on medium+ screens */}
                    <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 gap-2">
                        {heroSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setHeroIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    heroIndex === i ? 'bg-secondary w-8' : 'bg-white/40 hover:bg-white/70 w-2'
                                }`}
                            />
                        ))}
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

                {/* New Arrivals */}
                {/* <section className="py-12 bg-surface-dark w-full">
                    <div className="px-4 md:px-10 max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Fresh off the loom</span>
                            <h2 className="text-white text-3xl md:text-4xl font-bold">New Arrivals</h2>
                            <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {/* Product 1 
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
                            Product 2
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
                            Product 3
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
                             Product 4 
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
                </section> */}

                {/* Shop by Occasion */}
                <section className="py-16 md:py-24 px-4 md:px-10 bg-background-dark w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <div className="text-center">
                                <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Celebrate Every Moment</span>
                                <h2 className="text-white text-3xl md:text-4xl font-bold">Shop by <span className="text-secondary italic">Occasion</span></h2>
                                <div className="w-24 h-1 bg-secondary mt-4 rounded-full"></div>
                            </div>
                            
                            {/* Top Right Navigation */}
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-primary text-sm font-bold tracking-widest uppercase">Explore All</span>
                                <button
                                    onClick={scrollCategoryLeft}
                                    className="bg-primary hover:bg-secondary text-background-dark p-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={scrollCategoryRight}
                                    className="bg-primary hover:bg-secondary text-background-dark p-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {categoriesLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : categories.length > 0 ? (
                            <div className="relative">
                                {/* Categories Scroll Container */}
                                <div
                                    ref={categoryScrollRef}
                                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 hide-scrollbar"
                                >
                                    {categories.map((category) => (
                                        <div
                                            key={category._id}
                                            onClick={() => handleCategoryClick(category._id)}
                                            className="flex-shrink-0 snap-start cursor-pointer group"
                                            data-occasion-card
                                        >
                                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl w-[220px] sm:w-[260px] md:w-[300px] h-[280px] sm:h-[320px] md:h-[360px]">
                                                {/* Category Image */}
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                {/* Category Name */}
                                                <div className="absolute inset-0 flex items-end p-4 md:p-6">
                                                    <div>
                                                        <h3 className="text-white text-xl md:text-2xl font-bold capitalize">
                                                            {category.name}
                                                        </h3>
                                                        {/* {category.description && (
                                                            <p className="text-white/70 text-xs md:text-sm mt-1 line-clamp-2">
                                                                {category.description}
                                                            </p>
                                                        )} */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 px-4">
                                <p className="text-white/60 text-lg">No occasions available at the moment</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Shop for Women */}
                <section className="py-16 md:py-24 px-4 md:px-10 bg-background-dark w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <div className="text-center">
                                <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Elegance & Style</span>
                                <h2 className="text-white text-3xl md:text-4xl font-bold">Shop <span className="text-secondary italic">Women</span></h2>
                                <div className="w-24 h-1 bg-secondary mt-4 rounded-full"></div>
                            </div>
                            
                            {/* Top Right Navigation */}
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-primary text-sm font-bold tracking-widest uppercase">Explore All</span>
                                <button
                                    onClick={scrollWomenLeft}
                                    className="bg-primary hover:bg-secondary text-background-dark p-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={scrollWomenRight}
                                    className="bg-primary hover:bg-secondary text-background-dark p-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {womenLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : womenCategories.length > 0 ? (
                            <div className="relative">
                                {/* Women Categories Scroll Container */}
                                <div
                                    ref={womenScrollRef}
                                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 hide-scrollbar"
                                >
                                    {womenCategories.map((category) => (
                                        <div
                                            key={category._id}
                                            onClick={() => handleCategoryClick(category._id)}
                                            className="flex-shrink-0 snap-start cursor-pointer group"
                                            data-women-card
                                        >
                                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl w-[220px] sm:w-[260px] md:w-[300px] h-[280px] sm:h-[320px] md:h-[360px]">
                                                {/* Category Image */}
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                {/* Category Name */}
                                                <div className="absolute inset-0 flex items-end p-4 md:p-6">
                                                    <div>
                                                        <h3 className="text-white text-xl md:text-2xl font-bold capitalize">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 px-4">
                                <p className="text-white/60 text-lg">No women categories available at the moment</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Shop Accessories */}
                <section className="py-16 md:py-24 px-4 md:px-10 bg-background-dark w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <div className="text-center">
                                <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Complete Your Look</span>
                                <h2 className="text-white text-3xl md:text-4xl font-bold">Shop <span className="text-secondary italic">Accessories</span></h2>
                                <div className="w-24 h-1 bg-secondary mt-4 rounded-full"></div>
                            </div>
                            
                            {/* Top Right Navigation */}
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-primary text-sm font-bold tracking-widest uppercase">Explore All</span>
                                <button
                                    onClick={scrollAccessoriesLeft}
                                    className="bg-primary hover:bg-secondary text-background-dark p-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={scrollAccessoriesRight}
                                    className="bg-primary hover:bg-secondary text-background-dark p-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {accessoriesLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : accessoriesCategories.length > 0 ? (
                            <div className="relative">
                                {/* Accessories Categories Scroll Container */}
                                <div
                                    ref={accessoriesScrollRef}
                                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 hide-scrollbar"
                                >
                                    {accessoriesCategories.map((category) => (
                                        <div
                                            key={category._id}
                                            onClick={() => handleCategoryClick(category._id)}
                                            className="flex-shrink-0 snap-start cursor-pointer group"
                                            data-accessories-card
                                        >
                                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl w-[220px] sm:w-[260px] md:w-[300px] h-[280px] sm:h-[320px] md:h-[360px]">
                                                {/* Category Image */}
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                {/* Category Name */}
                                                <div className="absolute inset-0 flex items-end p-4 md:p-6">
                                                    <div>
                                                        <h3 className="text-white text-xl md:text-2xl font-bold capitalize">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 px-4">
                                <p className="text-white/60 text-lg">No accessories available at the moment</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Featured Videos */}
                <section className="py-16 md:py-24 bg-background-dark w-full overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 px-4">
                            <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Watch & Shop</span>
                            <h2 className="text-white text-3xl md:text-4xl font-bold">Featured Videos</h2>
                            <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                        </div>
                        
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 px-4">
                                <p className="text-red-500 text-lg">{error}</p>
                            </div>
                        ) : videos.length > 0 ? (
                            <div className="relative flex items-center gap-3 md:gap-4">
                                {/* Left Arrow Button */}
                                <button
                                    onClick={scrollLeft}
                                    className="hidden md:flex flex-shrink-0 bg-primary hover:bg-secondary text-background-dark p-3 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl items-center justify-center"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                {/* Horizontal Scroll Container */}
                                <div 
                                    ref={scrollContainerRef}
                                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 hide-scrollbar w-full min-h-[500px] md:min-h-[600px] px-4"
                                >
                                    {videos.map((video, index) => {
                                        const isCenter = index === currentVideoIndex;
                                        return (
                                            <div
                                                key={video._id}
                                                className={`flex-shrink-0 snap-center transition-all duration-500 ${
                                                    isCenter 
                                                        ? 'w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px]' 
                                                        : 'w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px]'
                                                }`}
                                            >
                                                <div 
                                                    className={`relative group rounded-xl md:rounded-2xl overflow-hidden shadow-2xl bg-surface-dark transition-all duration-500 cursor-pointer ${
                                                        isCenter ? 'scale-105 ring-2 ring-primary/50 shadow-primary/20' : 'scale-95 opacity-80 hover:opacity-100'
                                                    }`}
                                                    onClick={() => video.productId && openModal(video)}
                                                >
                                                    {/* Video */}
                                                    <video
                                                        src={buildMediaUrl(video.url)}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        className="w-full aspect-[3/4] object-cover"
                                                        poster={video.thumbnailUrl}
                                                    />
                                                    
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                    
                                                    {/* Video Info - Always visible at bottom */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                                        <h3 className="text-white text-base md:text-lg font-bold mb-1 line-clamp-1">
                                                            {video.title}
                                                        </h3>
                                                        
                                                        {/* Product Info */}
                                                        {video.productId && (
                                                            <div className="space-y-2">
                                                                <p className="text-white/90 text-sm line-clamp-1">
                                                                    {video.productId.name}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-secondary font-bold text-lg">
                                                                        ₹ {video.productId.price?.toLocaleString()}
                                                                    </p>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openModal(video);
                                                                        }}
                                                                        className="bg-primary hover:bg-secondary text-background-dark px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 shadow-lg"
                                                                    >
                                                                        View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {!video.productId && (
                                                            <p className="text-white/70 text-xs line-clamp-2">
                                                                {video.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Right Arrow Button */}
                                <button
                                    onClick={scrollRight}
                                    className="hidden md:flex flex-shrink-0 bg-primary hover:bg-secondary text-background-dark p-3 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl items-center justify-center"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-20 px-4">
                                <p className="text-white/60 text-lg">No videos available at the moment</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Shop Lifestyle Section */}
                <section className="relative w-full h-[400px] md:h-[600px] bg-background-dark overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `linear-gradient(135deg, rgba(16,34,22,0.6) 0%, rgba(16,34,22,0.8) 100%), url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0')`,
                        }}
                    />

                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center max-w-4xl mx-auto">
                        <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 md:mb-6 drop-shadow-lg">
                            Shop from the comfort of your home
                        </h2>
                        <p className="text-white/90 text-base md:text-lg mb-8 md:mb-10 font-light max-w-2xl">
                            Experience our luxury collection with personalized service. Browse our curated pieces and connect with our style experts.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-secondary hover:bg-primary text-background-dark px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold text-sm md:text-base tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Our Collection
                        </button>
                    </div>
                </section>

                {/* Video Modal */}
                {isModalOpen && selectedVideo && (
                    <VideoModal video={selectedVideo} onClose={closeModal} />
                )}
            </>
        );
    };

    export default Home;
