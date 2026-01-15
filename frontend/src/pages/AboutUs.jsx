import React from 'react';
import { Award, Sparkles, Users, Heart, TrendingUp, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-background-dark overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-10 w-96 h-96 bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 inline-block">
                        <span className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-sm font-semibold tracking-wide">
                            Our Story
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        Crafting <span className="italic text-secondary">Timeless Elegance</span> Since 1995
                    </h1>
                    <p className="text-white/70 text-lg md:text-xl max-w-3xl font-light mb-8">
                        At JewelCraft, we believe that ethnic wear is more than just clothing—it's a celebration of heritage, tradition, and personal style. Our journey began with a simple vision: to create the most exquisite Sherwanis and Lehengas that honor our cultural roots while embracing contemporary design.
                    </p>
                </div>
            </section>

            {/* Journey Section */}
            <section className="relative z-10 px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-16">Our Journey</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                year: "1995",
                                title: "The Beginning",
                                description: "Started with a small atelier in New Delhi, crafting custom Sherwanis for family and friends."
                            },
                            {
                                year: "2005",
                                title: "National Recognition",
                                description: "Expanded to 5 stores across major Indian cities and won 'Best Ethnic Wear' award."
                            },
                            {
                                year: "2024",
                                title: "Digital Revolution",
                                description: "Launched our online platform to serve clients worldwide while maintaining our handcrafted excellence."
                            }
                        ].map((milestone, idx) => (
                            <div key={idx} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-surface-dark border border-primary/20 rounded-2xl p-8 hover:border-primary/50 transition-colors">
                                    <div className="text-5xl font-black text-primary mb-4">{milestone.year}</div>
                                    <h3 className="text-white font-bold text-xl mb-3">{milestone.title}</h3>
                                    <p className="text-white/60">{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="relative z-10 px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-16 text-center">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: "Craftsmanship",
                                description: "Every piece is meticulously crafted by artisans with decades of experience, ensuring unparalleled quality and detail."
                            },
                            {
                                icon: Heart,
                                title: "Passion",
                                description: "We pour our hearts into every creation, driven by a deep passion for ethnic fashion and cultural preservation."
                            },
                            {
                                icon: Users,
                                title: "Community",
                                description: "We support local artisans and believe in creating positive impact in the communities we operate in."
                            },
                            {
                                icon: Award,
                                title: "Excellence",
                                description: "We never compromise on quality, using only premium fabrics and materials sourced from trusted suppliers."
                            },
                            {
                                icon: TrendingUp,
                                title: "Innovation",
                                description: "While honoring tradition, we continuously innovate to bring contemporary designs that appeal to modern aesthetics."
                            },
                            {
                                icon: Globe,
                                title: "Sustainability",
                                description: "We're committed to eco-friendly practices and ethical manufacturing to protect our planet for future generations."
                            }
                        ].map((value, idx) => {
                            const IconComponent = value.icon;
                            return (
                                <div key={idx} className="group relative bg-surface-dark border border-primary/20 rounded-2xl p-8 hover:border-secondary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <IconComponent className="w-12 h-12 text-secondary mb-4 group-hover:scale-110 transition-transform duration-300" />
                                        <h3 className="text-white font-bold text-xl mb-3">{value.title}</h3>
                                        <p className="text-white/60">{value.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 px-4 py-20 bg-surface-dark/50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: "29+", label: "Years of Excellence" },
                            { number: "50K+", label: "Happy Customers" },
                            { number: "500+", label: "Skilled Artisans" },
                            { number: "15", label: "Design Collections" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-primary mb-2">{stat.number}</div>
                                <p className="text-white/60">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            {/* <section className="relative z-10 px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-16 text-center">Meet Our Leadership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Rajesh Kumar",
                                title: "Founder & Chief Designer",
                                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
                                bio: "A visionary with 35+ years in ethnic fashion design."
                            },
                            {
                                name: "Priya Sharma",
                                title: "Creative Director",
                                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
                                bio: "Leading our design innovation with a modern perspective."
                            },
                            {
                                name: "Amit Desai",
                                title: "Operations Head",
                                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
                                bio: "Ensuring excellence in every aspect of our operations."
                            }
                        ].map((member, idx) => (
                            <div key={idx} className="group relative">
                                <div className="relative overflow-hidden rounded-2xl mb-6 h-64 md:h-72">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-1">{member.name}</h3>
                                <p className="text-secondary font-semibold mb-3">{member.title}</p>
                                <p className="text-white/60">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Why Choose Us Section */}
            <section className="relative z-10 px-4 py-20 bg-surface-dark/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-16 text-center">Why Choose JewelCraft?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Uncompromising Quality",
                                description: "We use only premium fabrics sourced from the finest mills in India, ensuring your garment lasts generations."
                            },
                            {
                                title: "Custom Tailoring",
                                description: "Get your perfect fit with our bespoke tailoring service. We customize every detail to your specifications."
                            },
                            {
                                title: "Expert Consultation",
                                description: "Our style experts are available to help you choose the perfect design that complements your personality."
                            },
                            {
                                title: "Ethical Practices",
                                description: "We ensure fair wages and safe working conditions for all our artisans, supporting traditional craftsmanship."
                            },
                            {
                                title: "Timeless Designs",
                                description: "Our collections blend traditional patterns with contemporary aesthetics for pieces you'll cherish forever."
                            },
                            {
                                title: "Global Delivery",
                                description: "Wherever you are in the world, we deliver the same exceptional quality and service."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-surface-dark border border-primary/20 rounded-xl p-6 hover:border-primary/50 transition-colors">
                                <h3 className="text-white font-bold text-lg mb-3">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience JewelCraft?</h2>
                    <p className="text-white/70 text-lg mb-10">
                        Explore our collections and discover why thousands of customers trust us with their most special moments.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/collection" className="bg-primary text-background-dark hover:bg-secondary px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(17,212,82,0.3)]">
                            Explore Collections
                        </Link>
                        <Link to="/contact-us" className="border border-primary hover:bg-primary/10 text-white hover:text-primary px-8 py-3.5 rounded-full font-bold transition-all duration-300">
                            Get In Touch
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
