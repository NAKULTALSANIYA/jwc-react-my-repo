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
            image: '/hero01.jpeg',
        },
        // Rose Gold Lehenga (bridal elegance)
        {
            image: '/hero02.jpeg',
        },
        // Emerald Silk Kurta (festive menswear)
        {
            image: '/hero03.jpeg',
        },
        // Golden Banarasi Saree (heritage womenswear)
        {
            image: '/hero04.jpeg',
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
            if (scrollWidth <= clientWidth) return () => { };

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
                            className={`absolute inset-0 transition-opacity duration-700 bg-cover bg-center bg-no-repeat ${heroIndex === i ? 'opacity-100' : 'opacity-0'
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
                    </div>
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
                            className={`h-2 rounded-full transition-all duration-300 ${heroIndex === i ? 'bg-secondary w-8' : 'bg-white/40 hover:bg-white/70 w-2'
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
                                            className={`flex-shrink-0 snap-center transition-all duration-500 ${isCenter
                                                    ? 'w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px]'
                                                    : 'w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px]'
                                                }`}
                                        >
                                            <div
                                                className={`relative group rounded-xl md:rounded-2xl overflow-hidden shadow-2xl bg-surface-dark transition-all duration-500 cursor-pointer ${isCenter ? 'scale-105 ring-2 ring-primary/50 shadow-primary/20' : 'scale-95 opacity-80 hover:opacity-100'
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

            {/* Gallery Section */}
            <section className="py-16 md:py-24 px-4 md:px-10 bg-background-dark w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">Our Collections</span>
                        <h2 className="text-white text-3xl md:text-4xl font-bold">Explore Our <span className="text-secondary italic">Gallery</span></h2>
                        <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Image Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Large Featured Card - Takes 2 columns on large screens */}
                        <div className="lg:col-span-2 lg:row-span-2 group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-2xl h-full min-h-[400px] lg:min-h-[600px]">
                                <img
                                    src="/shop1.JPG"
                                    alt="Premium Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Medium Card 1 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[250px] lg:min-h-[290px]">
                                <img
                                    src="/shop2.JPG"
                                    alt="Ethnic Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Medium Card 2 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[250px] lg:min-h-[290px]">
                                <img
                                    src="/shop3.JPG"
                                    alt="Festive Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Medium Card 3 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[250px] lg:min-h-[290px]">
                                <img
                                    src="/shop4.JPG"
                                    alt="Designer Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Medium Card 4 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[250px] lg:min-h-[290px]">
                                <img
                                    src="/shop5.JPG"
                                    alt="Bridal Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Small Cards Row */}
                        <div className="sm:col-span-2 lg:col-span-1 group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[200px]">
                                <img
                                    src="/shop6.JPG"
                                    alt="Contemporary Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1 group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[200px]">
                                <img
                                    src="/shop7.JPG"
                                    alt="Luxury Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1 group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[200px]">
                                <img
                                    src="/shop8.JPG"
                                    alt="Casual Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1 group cursor-pointer">
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-full min-h-[200px]">
                                <img
                                    src="/shop9.JPG"
                                    alt="Accessories Collection"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>
                    </div>
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