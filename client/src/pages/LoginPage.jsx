import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

/**
 * Login page
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async credentials => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: data => {
      login(data.user, data.token);
      navigate('/');
    },
    onError: err => {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted mt-2">Sign in to your VibeBlog account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-lg flex items-center gap-3">
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="link-hover font-medium">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
