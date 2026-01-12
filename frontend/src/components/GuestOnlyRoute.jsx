import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated } from '../hooks/useAuth';

const GuestOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default GuestOnlyRoute;
