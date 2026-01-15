import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MapPinIcon, Clock, X } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showMap, setShowMap] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${API_URL}/contact`, formData);
            
            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
                // Reset success message after 5 seconds
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-10 w-96 h-96 bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-6 inline-block">
                        <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-semibold tracking-wide">
                            Get In Touch
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        We'd Love to Hear <span className="italic text-secondary">From You</span>
                    </h1>
                    <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light mb-8">
                        Have questions about our collections? Need assistance with your order? Or just want to say hello? Reach out to us and we'll get back to you shortly.
                    </p>
                </div>
            </section>

            {/* Contact Information Cards */}
            <section className="relative z-10 px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* Email Card */}
                        <div className="group relative bg-gradient-to-br from-surface-dark to-surface-dark/50 border border-primary/20 hover:border-primary/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(17,212,82,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                                    <Mail className="text-primary w-7 h-7" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Email Us</h3>
                                <p className="text-white/60 mb-4">We respond within 24 hours</p>
                                <a href="mailto:support@jewelcraft.com" className="text-primary hover:text-secondary transition-colors font-semibold">
                                    support@jewelcraft.com
                                </a>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="group relative bg-gradient-to-br from-surface-dark to-surface-dark/50 border border-secondary/20 hover:border-secondary/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                                    <Phone className="text-secondary w-7 h-7" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Call Us</h3>
                                <p className="text-white/60 mb-4">Mon - Fri, 10AM - 6PM IST</p>
                                <a href="tel:+919876543210" className="text-secondary hover:text-primary transition-colors font-semibold">
                                    +91 98765 43210
                                </a>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="group relative bg-gradient-to-br from-surface-dark to-surface-dark/50 border border-primary/20 hover:border-primary/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(17,212,82,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                                    <MapPin className="text-primary w-7 h-7" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Visit Us</h3>
                                <p className="text-white/60 mb-4">Rajkot,Gujarat</p>
                                <p 
                                    onClick={() => setShowMap(true)}
                                    className="text-primary hover:text-secondary transition-colors font-semibold cursor-pointer"
                                >
                                    Show on Map
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="relative z-10 px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-background-dark border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                        {/* Success Message */}
                        {success && (
                            <div className="mb-8 p-4 bg-primary/10 border border-primary/50 rounded-xl flex items-center gap-3 animate-fade-in">
                                <CheckCircle className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-primary font-semibold">Message Sent Successfully!</p>
                                    <p className="text-primary/80 text-sm">We'll get back to you as soon as possible.</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3">
                                <AlertCircle className="text-red-500 w-6 h-6 flex-shrink-0" />
                                <p className="text-red-500 font-semibold">{error}</p>
                            </div>
                        )}

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Send Us a Message</h2>
                        <p className="text-white/60 mb-8">Fill out the form below and we'll respond within 24 hours.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name and Email Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-semibold mb-3 text-sm">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your full name"
                                        className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-semibold mb-3 text-sm">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your.email@example.com"
                                        className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Phone and Subject Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-semibold mb-3 text-sm">Phone Number *</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        minLength={10}
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-semibold mb-3 text-sm">Subject *</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 appearance-none bg-no-repeat bg-right"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2311d452' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                            backgroundPosition: 'right 1rem center',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="" className="bg-surface-dark text-white">Select a subject</option>
                                        <option value="Product Inquiry" className="bg-surface-dark text-white">Product Inquiry</option>
                                        <option value="Order Issue" className="bg-surface-dark text-white">Order Issue</option>
                                        <option value="Feedback" className="bg-surface-dark text-white">Feedback</option>
                                        <option value="Partnership" className="bg-surface-dark text-white">Partnership</option>
                                        <option value="Other" className="bg-surface-dark text-white">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-white font-semibold mb-3 text-sm">Message *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="Tell us more about your inquiry..."
                                    rows="6"
                                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer w-full bg-gradient-to-r from-primary to-primary hover:shadow-[0_0_30px_rgba(17,212,82,0.4)] disabled:opacity-50 disabled:cursor-not-allowed text-background-dark font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-center text-white/50 text-sm">
                                We respect your privacy. Your information is safe with us.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-white/60">Quick answers to common inquiries</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How long does delivery take?",
                                a: "Standard delivery takes 5-7 business days across India. Express delivery (2-3 days) is available for select locations."
                            },
                            {
                                q: "Can I customize my order?",
                                a: "Yes! We offer custom tailoring and personalization for most of our products. Contact us for details."
                            },
                            {
                                q: "What's your return policy?",
                                a: "We offer 30-day returns for unworn items with original tags. Custom orders are non-returnable."
                            },
                            {
                                q: "Do you offer international shipping?",
                                a: "Yes, we ship to select international locations. Please contact us for shipping rates and details."
                            }
                        ].map((item, idx) => (
                            <details key={idx} className="group border border-primary/20 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                                <summary className="flex items-center justify-between cursor-pointer bg-surface-dark/50 px-6 py-4 hover:bg-surface-dark transition-colors">
                                    <span className="text-white font-semibold">{item.q}</span>
                                    <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="px-6 py-4 bg-background-dark/50 border-t border-primary/20">
                                    <p className="text-white/70">{item.a}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Modal */}
            {showMap && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setShowMap(false)}
                >
                    <div 
                        className="relative w-full max-w-4xl bg-surface-dark rounded-2xl overflow-hidden border border-primary/30 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowMap(false)}
                            className="absolute top-4 right-4 z-10 bg-background-dark/90 hover:bg-background-dark text-white rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Map Header */}
                        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/30 px-6 py-4">
                            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                <MapPin className="text-primary" />
                                Our Location
                            </h3>
                            <p className="text-white/60 text-sm mt-1">
                                Dr Yagnik Rd, Rajkot, Gujarat 360001
                            </p>
                        </div>

                        {/* Google Maps Iframe */}
                        <div className="relative w-full h-[500px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29533.56258401559!2d70.75723291083985!3d22.289528299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959cbb9e7e89b0f%3A0xe969c7a0f00a8c97!2sJalaram%20wedding%20couture!5e0!3m2!1sen!2sin!4v1768495275224!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Jalaram Wedding Couture Location"
                            ></iframe>
                        </div>

                        {/* Map Footer */}
                        <div className="bg-background-dark/50 border-t border-primary/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-white/70 text-sm">
                                Click to get directions on Google Maps
                            </p>
                            <Link
                                to="https://www.google.com/maps/place/Jalaram+wedding+couture/@22.2895297,70.7930421,20.22z/data=!4m6!3m5!1s0x3959cbb9e7e89b0f:0xe969c7a0f00a8c97!8m2!3d22.2895283!4d70.7932818!16s%2Fg%2F11xzcrsp08?entry=ttu&g_ep=EgoyMDI2MDExMS4wIKXMDSoASAFQAw%3D%3D"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-primary hover:bg-primary/90 text-background-dark font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                Open in Google Maps
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactUs;
