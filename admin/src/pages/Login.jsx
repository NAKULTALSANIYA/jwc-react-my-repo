import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login(email.trim(), password);
      const nextPath = location.state?.from?.pathname || '/';
      navigate(nextPath, { replace: true });
    } catch (err) {
      // Check if error is due to non-admin user
      if (err.message?.includes('do not have permission') || err.message?.includes('customer')) {
        setError('Only admin accounts can access this panel. Please use a valid admin account.');
      } else {
        setError(err.message || 'Unable to login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2">Access your dashboard with your admin credentials.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <div className="mt-2 flex items-center gap-3 px-3 py-2.5 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 bg-slate-50/50">
              <Mail size={18} className="text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="admin@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <div className="mt-2 flex items-center gap-3 px-3 py-2.5 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 bg-slate-50/50">
              <Lock size={18} className="text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-slate-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
