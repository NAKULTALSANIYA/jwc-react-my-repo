import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister, initiateGoogleLogin } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [displayError, setDisplayError] = useState(null);

    const registerMutation = useRegister();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        setDisplayError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setDisplayError(null);
        // Combine firstName and lastName into name for backend
        const registrationData = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password
        };
        registerMutation.mutate(registrationData, {
            onError: (error) => {
                // Extract error message from various possible response structures
                let errorMsg = 'Registration failed. Please try again.';
                
                if (error?.response?.data?.message) {
                    errorMsg = error.response.data.message;
                } else if (error?.response?.data?.error) {
                    errorMsg = error.response.data.error;
                } else if (error?.message) {
                    errorMsg = error.message;
                }
                
                setDisplayError(errorMsg);
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
            {/* Left Side: Image */}
            <div className="relative w-full lg:w-1/2 h-64 lg:h-auto overflow-hidden group">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfyWitUlUDa91h1w73Qbgdw9mnJH0aULGG6n0OnylxFRm68KjhXGUue-Y20dFH0d-CI-3Ibbk8U4KaSIgxSOxuWzuGwelfHEsCFfe6Vyi_Cy9IyDuugJNdPx67HirTYrf33aqyCEC-0GXUMEV7o_1UxIXS6zcE-9nKEsLxHGh4vKhebd_HZv6aca7pRP_FKLwEdmImU-5K_nGE_wHp481JMbPXd1ssWQoMGtRpcQQi5EXJHudmu2zz5jIEpowqCbV3rSH-lddb_dYH')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background-dark/90"></div>
                <div className="absolute bottom-0 left-0 p-8 lg:p-16 z-10">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-2 tracking-tight">Join the <span className="text-secondary">Family</span></h2>
                    <p className="text-[#9db9a6] text-lg max-w-md">Create an account to unlock exclusive collections and personalized sizing.</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-background-dark p-6 lg:p-12">
                <div className="w-full max-w-[480px] flex flex-col gap-6">
                    <div className="flex flex-col gap-2 mb-4">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Create Account</h1>
                        <p className="text-[#9db9a6] text-base font-normal">Join us for a premium shopping experience</p>
                    </div>

                    {/* Error Message */}
                    {(displayError || registerMutation.isError) && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                            <div className="mt-1">{displayError || registerMutation.error?.response?.data?.message || registerMutation.error?.response?.data?.error || 'Registration failed. Please try again.'}</div>
                        </div>
                    )}

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-white text-sm font-medium leading-normal">First Name</span>
                                <input 
                                    type="text" 
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name" 
                                    className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" 
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-white text-sm font-medium leading-normal">Last Name</span>
                                <input 
                                    type="text" 
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name" 
                                    className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" 
                                    required
                                />
                            </label>
                        </div>

                        <label className="flex flex-col gap-2">
                            <span className="text-white text-sm font-medium leading-normal">Email</span>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email" 
                                className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" 
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-white text-sm font-medium leading-normal">Password</span>
                            <div className="relative flex w-full rounded-lg group">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password" 
                                    className="flex-1 rounded-l-lg rounded-r-none text-white border border-r-0 border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base font-normal leading-normal transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary z-0 group-hover:border-[#3b5441]"
                                    required
                                />
                                <div className="flex items-center justify-center px-4 bg-[#1a261e] border border-l-0 border-[#28392c] rounded-r-lg group-hover:border-[#3b5441] transition-colors">
                                    <button 
                                        className="text-[#9db9a6] hover:text-secondary focus:outline-none transition-colors" 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowPassword(!showPassword);
                                        }}
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </label>

                        <button 
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0bc038] hover:shadow-[0_0_15px_rgba(13,201,60,0.4)] transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <div className="flex items-center justify-center gap-2 mt-2">
                            <p className="text-[#9db9a6] text-sm">Already have an account?</p>
                            <Link to="/login" className="text-secondary font-bold text-sm hover:text-white transition-colors">Log In</Link>
                        </div>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-[#28392c]"></div>
                            <span className="flex-shrink mx-4 text-[#9db9a6]/50 text-xs uppercase tracking-widest">Or sign up with</span>
                            <div className="flex-grow border-t border-[#28392c]"></div>
                        </div>

                        <div className="grid gap-4">
                            <button 
                                className="flex items-center cursor-pointer justify-center gap-3 rounded-lg border border-[#28392c] bg-[#1a261e] h-12 hover:bg-[#28392c] hover:border-[#9db9a6]/30 transition-all" 
                                type="button"
                                onClick={initiateGoogleLogin}
                            >
                                <img alt="Google" className="w-5 h-5" src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" />
                                <span className="text-white text-sm font-medium">Google</span>
                            </button>
                            {/* <button className="flex items-center justify-center gap-3 rounded-lg border border-[#28392c] bg-[#1a261e] h-12 hover:bg-[#28392c] hover:border-[#9db9a6]/30 transition-all" type="button">
                                <img alt="Facebook" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-z4Vio42lBIzD5OsnAiytlQENxO_nQL_GQglyKflwF0qrzPgt6TgTkYN_fPeIwgFl8jtHJ-6pph3nfAjyCGctKRf9B7GZMQpajiwYLXduqJsRtCRf4ftEUjyffbpCYfAoEnL4_VZgPGTWOIJ-wJnll4fc9CKAblKj2IDYZjCxbfnNh4mXZInUh4P3Q3cK0anuMi37xpzDrxFqGB4UC0t_tVhhmRnbeajT3X_iz4txYoZdOh8_lVSzr_35ouQr9ZSs5n-aiu9ux6tw" />
                                <span className="text-white text-sm font-medium">Facebook</span>
                            </button> */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
