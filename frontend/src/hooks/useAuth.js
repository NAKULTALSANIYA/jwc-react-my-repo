import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as authService from '../api/services/auth.service';
import { tokenManager } from '../api/axios';
import { queryKeys } from '../api/queryClient';

/**
 * Custom hook for login
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Check if user is admin - prevent admin login on frontend
      const { accessToken, refreshToken, user } = data.data;
      
      if (user?.role === 'admin') {
        // Don't store tokens for admin users on frontend
        throw new Error('Admin accounts cannot login here. Please use the admin panel.');
      }

      // Store tokens
      tokenManager.setAccessToken(accessToken);
      tokenManager.setRefreshToken(refreshToken);
      tokenManager.setUser(user);

      // Set user in cache
      queryClient.setQueryData(queryKeys.auth.user, user);

      // Navigate to profile
      navigate('/products');
    }
  });
};

/**
 * Custom hook for registration
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Store tokens if registration returns them
      const { accessToken, refreshToken, user } = data.data;
      if (accessToken) {
        tokenManager.setAccessToken(accessToken);
        tokenManager.setRefreshToken(refreshToken);
        tokenManager.setUser(user);
        queryClient.setQueryData(queryKeys.auth.user, user);
        navigate('/products');
      } else {
        // If no auto-login, redirect to login page
        navigate('/login');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

/**
 * Custom hook for logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cache
      queryClient.clear();
      
      // Navigate to login
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Clear cache anyway
      queryClient.clear();
      navigate('/login');
    },
  });
};

/**
 * Custom hook to get current user profile
 */
export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      // Check if we have a token first
      const token = tokenManager.getAccessToken();
      if (!token) {
        return null;
      }

      try {
        const response = await authService.getProfile();
        const user = response.data?.user;
        tokenManager.setUser(user);
        return user;
      } catch (error) {
        // If profile fetch fails, clear tokens
        if (error.response?.status === 401) {
          tokenManager.clearTokens();
        }
        throw error;
      }
    },
    enabled: !!tokenManager.getAccessToken(), // Only run if token exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    initialData: () => tokenManager.getUser(), // Use cached user as initial data
  });
};

/**
 * Custom hook for update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      const updatedUser = data.data?.user;
      
      // Update cache
      queryClient.setQueryData(queryKeys.auth.user, updatedUser);
      tokenManager.setUser(updatedUser);
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
};

/**
 * Custom hook for Google login
 */
export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data.data;
      tokenManager.setAccessToken(accessToken);
      tokenManager.setRefreshToken(refreshToken);
      tokenManager.setUser(user);
      queryClient.setQueryData(queryKeys.auth.user, user);
      navigate('/products');
    },
    onError: (error) => {
      console.error('Google login error:', error);
    },
  });
};

/**
 * Custom hook for forgot password - initiates password reset
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });
};

/**
 * Custom hook for verify OTP
 */
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ resetSessionId, otp }) => authService.verifyOTP(resetSessionId, otp),
    onError: (error) => {
      console.error('Verify OTP error:', error);
    },
  });
};

/**
 * Custom hook for resend OTP
 */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: authService.resendOTP,
    onError: (error) => {
      console.error('Resend OTP error:', error);
    },
  });
};

/**
 * Custom hook for reset password - final step
 */
export const useResetPassword = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: ({ resetSessionId, password }) => authService.resetPassword(resetSessionId, password),
    onSuccess: () => {
      // Navigate to login after successful password reset
      navigate('/login');
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

/**
 * Function to initiate Google OAuth login
 */
export const initiateGoogleLogin = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  window.location.href = `${apiURL}/auth/google`;
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (role) => {
  const { data: user } = useUser();
  return user?.role === role;
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = () => {
  return useHasRole('admin');
};
