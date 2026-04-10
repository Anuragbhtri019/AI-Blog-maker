import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { Loader2, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidEmail } from '../lib/utils';

/**
 * Register page
 */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async credentials => {
      const response = await apiClient.post('/auth/register', credentials);
      return response.data;
    },
    onSuccess: data => {
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        login(data.user, data.token);
        navigate('/');
      }, 1500);
    },
    onError: err => {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold">Join VibeBlog</h1>
          <p className="text-muted mt-2">Create your account and start sharing</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-lg flex items-center gap-3">
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-accent bg-opacity-10 text-accent p-4 rounded-lg flex items-center gap-3">
              <CheckCircle size={18} />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="input-base pl-10"
              />
            </div>
          </div>

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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="link-hover font-medium">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
