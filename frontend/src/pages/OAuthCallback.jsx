import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../api/axios';
import * as authService from '../api/services/auth.service';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userId = searchParams.get('userId');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          navigate('/login?error=oauth_failed');
          return;
        }

        if (accessToken && refreshToken && userId) {
          // Store tokens
          tokenManager.setAccessToken(accessToken);
          tokenManager.setRefreshToken(refreshToken);
          
          // Fetch user profile
          try {
            const response = await authService.getProfile();
            const user = response.data?.user;
            if (user) {
              tokenManager.setUser(user);
            }
          } catch (err) {
            // Continue anyway, user will be fetched by useUser hook
          }
          
          // Redirect to home
          navigate('/products');
        } else {
          navigate('/login?error=missing_params');
        }
      } catch (err) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login?error=callback_error');
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-dark">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
            <p className="text-white/60 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white text-lg">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
