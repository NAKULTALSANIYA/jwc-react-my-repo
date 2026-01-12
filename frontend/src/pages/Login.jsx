import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLogin, initiateGoogleLogin, useForgotPassword, useVerifyOTP, useResendOTP, useResetPassword } from '../hooks/useAuth';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login', 'forgot', 'verify-otp', 'reset-password'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [resetData, setResetData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        resetSessionId: null,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [displayError, setDisplayError] = useState(null);
    const [displaySuccess, setDisplaySuccess] = useState(null);
    const [countdown, setCountdown] = useState(0);

    const loginMutation = useLogin();
    const forgotPasswordMutation = useForgotPassword();
    const verifyOTPMutation = useVerifyOTP();
    const resendOTPMutation = useResendOTP();
    const resetPasswordMutation = useResetPassword();

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (e) => {
        if (mode === 'login') {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        } else {
            setResetData({ ...resetData, [e.target.name]: e.target.value });
        }
        // Clear messages when user starts typing
        setDisplayError(null);
        setDisplaySuccess(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setDisplayError(null);
        setDisplaySuccess(null);

        if (mode === 'login') {
            loginMutation.mutate(formData, {
                onError: (error) => {
                    let errorMsg = 'Login failed. Please try again.';
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
        } else if (mode === 'forgot') {
            if (!resetData.email) {
                setDisplayError('Please enter your email address');
                return;
            }
            forgotPasswordMutation.mutate(resetData.email, {
                onSuccess: (response) => {
                    const sessionId = response.data?.resetSessionId;
                    if (sessionId) {
                        setResetData({ ...resetData, resetSessionId: sessionId });
                        setMode('verify-otp');
                        setDisplaySuccess('OTP sent to your email!');
                    } else {
                        setDisplayError('Failed to send OTP. Please try again.');
                    }
                },
                onError: (error) => {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP. Please try again.';
                    setDisplayError(errorMsg);
                },
            });
        } else if (mode === 'verify-otp') {
            if (!resetData.otp || resetData.otp.length !== 6) {
                setDisplayError('Please enter a valid 6-digit OTP');
                return;
            }
            verifyOTPMutation.mutate({ resetSessionId: resetData.resetSessionId, otp: resetData.otp }, {
                onSuccess: () => {
                    setDisplaySuccess('OTP verified successfully!');
                    setTimeout(() => {
                        setMode('reset-password');
                        setDisplaySuccess(null);
                    }, 1000);
                },
                onError: (error) => {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Invalid OTP. Please try again.';
                    setDisplayError(errorMsg);
                },
            });
        } else if (mode === 'reset-password') {
            if (!resetData.newPassword || !resetData.confirmPassword) {
                setDisplayError('Please fill in all fields');
                return;
            }
            if (resetData.newPassword.length < 6) {
                setDisplayError('Password must be at least 6 characters long');
                return;
            }
            if (resetData.newPassword !== resetData.confirmPassword) {
                setDisplayError('Passwords do not match');
                return;
            }
            resetPasswordMutation.mutate({ resetSessionId: resetData.resetSessionId, password: resetData.newPassword }, {
                onSuccess: () => {
                    setDisplaySuccess('Password reset successfully!');
                    setTimeout(() => {
                        // Reset everything
                        setMode('login');
                        setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '', resetSessionId: null });
                        setDisplaySuccess('Password reset successful! Please login with your new password.');
                    }, 1500);
                },
                onError: (error) => {
                    const errorMessage = error.response?.data?.message;
                    if (errorMessage?.includes('OTP not verified')) {
                        setDisplayError('Session expired. Please start again.');
                        setTimeout(() => {
                            setMode('forgot');
                            setResetData({ ...resetData, otp: '', resetSessionId: null });
                        }, 2000);
                    } else {
                        setDisplayError(errorMessage || 'Failed to reset password. Please try again.');
                    }
                },
            });
        }
    };

    const handleResendOTP = () => {
        setDisplayError(null);
        setDisplaySuccess(null);
        resendOTPMutation.mutate(resetData.resetSessionId, {
            onSuccess: () => {
                setDisplaySuccess('New OTP sent to your email!');
                setCountdown(60);
                setResetData({ ...resetData, otp: '' });
            },
            onError: (error) => {
                setDisplayError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
            },
        });
    };

    const handleBackToLogin = () => {
        setMode('login');
        setDisplayError(null);
        setDisplaySuccess(null);
        setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '', resetSessionId: null });
    };

    const handleOTPChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setResetData({ ...resetData, otp: value });
        }
        setDisplayError(null);
    };

    // Get title and description based on mode
    const getHeaderContent = () => {
        switch (mode) {
            case 'forgot':
                return {
                    title: 'Forgot Password',
                    description: 'Enter your email to receive an OTP'
                };
            case 'verify-otp':
                return {
                    title: 'Verify OTP',
                    description: 'Enter the 6-digit code sent to your email'
                };
            case 'reset-password':
                return {
                    title: 'Reset Password',
                    description: 'Enter your new password'
                };
            default:
                return {
                    title: 'Welcome Back',
                    description: 'Sign in to access your exclusive wedding collection'
                };
        }
    };

    const { title, description } = getHeaderContent();
    const isLoading = loginMutation.isPending || forgotPasswordMutation.isPending || 
                     verifyOTPMutation.isPending || resetPasswordMutation.isPending;

    return (
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
            {/* Left Side: Image (Desktop only) or Top Image (Mobile) */}
            <div className="relative w-full lg:w-1/2 h-64 lg:h-auto overflow-hidden group">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfyWitUlUDa91h1w73Qbgdw9mnJH0aULGG6n0OnylxFRm68KjhXGUue-Y20dFH0d-CI-3Ibbk8U4KaSIgxSOxuWzuGwelfHEsCFfe6Vyi_Cy9IyDuugJNdPx67HirTYrf33aqyCEC-0GXUMEV7o_1UxIXS6zcE-9nKEsLxHGh4vKhebd_HZv6aca7pRP_FKLwEdmImU-5K_nGE_wHp481JMbPXd1ssWQoMGtRpcQQi5EXJHudmu2zz5jIEpowqCbV3rSH-lddb_dYH')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background-dark/90"></div>
                {/* Content on Image */}
                <div className="absolute bottom-0 left-0 p-8 lg:p-16 z-10 animate-fade-in-up">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-2 tracking-tight">Tradition meets <span className="text-secondary">Luxury</span></h2>
                    <p className="text-[#9db9a6] text-lg max-w-md">Discover the finest collection of ethnic wear crafted for your special moments.</p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-background-dark p-6 lg:p-12">
                <div className="w-full max-w-[480px] flex flex-col gap-6">
                    {/* Back Button (for password reset flow) */}
                    {mode !== 'login' && (
                        <button
                            onClick={handleBackToLogin}
                            className="flex items-center gap-2 text-[#9db9a6] hover:text-secondary transition-colors w-fit"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to Login</span>
                        </button>
                    )}

                    {/* Header */}
                    <div className="flex flex-col gap-2 mb-4">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">{title}</h1>
                        <p className="text-[#9db9a6] text-base font-normal">{description}</p>
                    </div>

                    {/* Error Message */}
                    {displayError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                            <div className="mt-1">{displayError}</div>
                        </div>
                    )}

                    {/* Success Message */}
                    {displaySuccess && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm">
                            <div className="mt-1">{displaySuccess}</div>
                        </div>
                    )}

                    {/* Form */}
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {/* LOGIN MODE */}
                        {mode === 'login' && (
                            <>
                                {/* Email Field */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-white text-sm font-medium leading-normal">Email or Username</span>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base font-normal leading-normal transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary hover:border-[#3b5441]"
                                            required
                                        />
                                    </div>
                                </label>

                                {/* Password Field */}
                                <label className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm font-medium leading-normal">Password</span>
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot')}
                                            className="text-secondary text-sm font-medium hover:underline hover:text-primary transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="relative flex w-full rounded-lg group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            className="flex-1 rounded-l-lg rounded-r-none text-white border border-r-0 border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base font-normal leading-normal transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary z-0 group-hover:border-[#3b5441]"
                                            required
                                        />
                                        <div className="flex items-center justify-center px-4 bg-[#1a261e] border border-l-0 border-[#28392c] rounded-r-lg group-hover:border-[#3b5441] transition-colors">
                                            <button 
                                                className="text-[#9db9a6] hover:text-secondary focus:outline-none transition-colors" 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </label>

                                {/* Login Button */}
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0bc038] hover:shadow-[0_0_15px_rgba(13,201,60,0.4)] transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </button>

                                {/* Register Link */}
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <p className="text-[#9db9a6] text-sm">New to Jalaram?</p>
                                    <Link to="/register" className="text-secondary font-bold text-sm hover:text-white transition-colors">Create an Account</Link>
                                </div>

                                {/* Divider */}
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-[#28392c]"></div>
                                    <span className="flex-shrink mx-4 text-[#9db9a6]/50 text-xs uppercase tracking-widest">Or continue with</span>
                                    <div className="flex-grow border-t border-[#28392c]"></div>
                                </div>

                                {/* Social Login */}
                                <div className="grid gap-4">
                                    <button 
                                        className="flex items-center cursor-pointer justify-center gap-3 rounded-lg border border-[#28392c] bg-[#1a261e] h-12 hover:bg-[#28392c] hover:border-[#9db9a6]/30 transition-all" 
                                        type="button"
                                        onClick={initiateGoogleLogin}
                                    >
                                        <img alt="Google" className="w-5 h-5" src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" />
                                        <span className="text-white text-sm font-medium">Google</span>
                                    </button>
                                </div>
                            </>
                        )}

                        {/* FORGOT PASSWORD MODE */}
                        {mode === 'forgot' && (
                            <>
                                <label className="flex flex-col gap-2">
                                    <span className="text-white text-sm font-medium leading-normal">Email Address</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={resetData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base font-normal leading-normal transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary hover:border-[#3b5441]"
                                        required
                                    />
                                </label>

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0bc038] hover:shadow-[0_0_15px_rgba(13,201,60,0.4)] transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending OTP...
                                        </span>
                                    ) : 'Send OTP'}
                                </button>
                            </>
                        )}

                        {/* VERIFY OTP MODE */}
                        {mode === 'verify-otp' && (
                            <>
                                <label className="flex flex-col gap-2">
                                    <span className="text-white text-sm font-medium leading-normal">Enter OTP</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        name="otp"
                                        value={resetData.otp}
                                        onChange={handleOTPChange}
                                        placeholder="000000"
                                        className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-center text-2xl tracking-widest font-semibold transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary hover:border-[#3b5441]"
                                        required
                                        autoComplete="off"
                                    />
                                    <p className="text-xs text-[#9db9a6]/70">Enter the 6-digit code from your email</p>
                                </label>

                                <button 
                                    type="submit"
                                    disabled={isLoading || resetData.otp.length !== 6}
                                    className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0bc038] hover:shadow-[0_0_15px_rgba(13,201,60,0.4)] transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </span>
                                    ) : 'Verify OTP'}
                                </button>

                                {/* Resend OTP */}
                                <div className="flex items-center justify-center">
                                    {countdown > 0 ? (
                                        <span className="text-[#9db9a6] text-sm">
                                            Resend OTP in {countdown}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={resendOTPMutation.isPending}
                                            className="text-secondary text-sm font-medium hover:underline hover:text-primary transition-colors disabled:opacity-50"
                                        >
                                            {resendOTPMutation.isPending ? 'Sending...' : 'Resend OTP'}
                                        </button>
                                    )}
                                </div>

                                <p className="text-center text-xs text-[#9db9a6]/50">OTP expires in 10 minutes</p>
                            </>
                        )}

                        {/* RESET PASSWORD MODE */}
                        {mode === 'reset-password' && (
                            <>
                                <label className="flex flex-col gap-2">
                                    <span className="text-white text-sm font-medium leading-normal">New Password</span>
                                    <div className="relative flex w-full rounded-lg group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={resetData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            className="flex-1 rounded-l-lg rounded-r-none text-white border border-r-0 border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base font-normal leading-normal transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary z-0 group-hover:border-[#3b5441]"
                                            required
                                        />
                                        <div className="flex items-center justify-center px-4 bg-[#1a261e] border border-l-0 border-[#28392c] rounded-r-lg group-hover:border-[#3b5441] transition-colors">
                                            <button 
                                                className="text-[#9db9a6] hover:text-secondary focus:outline-none transition-colors" 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#9db9a6]/70">Must be at least 6 characters</p>
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-white text-sm font-medium leading-normal">Confirm Password</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={resetData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className="flex w-full rounded-lg text-white border border-[#28392c] bg-[#1a261e] h-14 placeholder:text-[#9db9a6]/40 px-4 text-base font-normal leading-normal transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary hover:border-[#3b5441]"
                                        required
                                    />
                                </label>

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0bc038] hover:shadow-[0_0_15px_rgba(13,201,60,0.4)] transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting Password...
                                        </span>
                                    ) : 'Reset Password'}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
