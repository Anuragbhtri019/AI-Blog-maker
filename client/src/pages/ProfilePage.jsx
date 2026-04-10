import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { Loader2, User, Mail, Calendar, Upload, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { formatDate } from '../lib/utils';

/**
 * User profile page showing user info with settings
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Form states
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');

  /**
   * Fetch user's blogs
   */
  const {
    data: blogs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userBlogs', user?._id],
    queryFn: async () => {
      const response = await apiClient.get('/blogs/user/me');
      return response.data;
    },
  });

  /**
   * Upload profile image mutation
   */
  const uploadImageMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiClient.post('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.user);
      setGeneralSuccess('Profile image updated successfully');
      setTimeout(() => setGeneralSuccess(''), 3000);
    },
    onError: (err) => {
      setGeneralError(err.response?.data?.message || 'Failed to update profile image');
    },
  });

  /**
   * Change password mutation
   */
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/auth/change-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.user);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setGeneralSuccess('Password changed successfully');
      setTimeout(() => setGeneralSuccess(''), 3000);
    },
    onError: (err) => {
      setPasswordErrors({ submit: err.response?.data?.message || 'Failed to change password' });
    },
  });

  /**
   * Handle profile image change
   */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    const formData = new FormData();
    formData.append('profileImage', file);
    uploadImageMutation.mutate(formData);
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validation
    if (!passwordData.oldPassword) {
      setPasswordErrors((prev) => ({ ...prev, oldPassword: 'Old password is required' }));
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 6 characters' }));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success/Error Messages */}
        {generalSuccess && (
          <div className="mb-6 p-4 bg-accent bg-opacity-10 text-accent rounded-lg flex items-center gap-3 card">
            <CheckCircle size={20} />
            <p className="text-sm">{generalSuccess}</p>
          </div>
        )}

        {generalError && (
          <div className="mb-6 p-4 bg-danger bg-opacity-10 text-danger rounded-lg flex items-center gap-3 card">
            <AlertCircle size={20} />
            <p className="text-sm">{generalError}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="card mb-12 flex flex-col md:flex-row items-start md:items-center gap-8 bg-surface border border-muted/30">
          {/* Avatar with Upload */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-5xl text-white font-bold shadow-lg overflow-hidden">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg transition-colors"
              title="Change profile image"
            >
              <Upload size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <h1 className="text-4xl font-bold text-text mb-1">
              {user?.name}
            </h1>
            <p className="text-sm text-primary font-semibold mb-4">Profile Owner</p>

            <div className="space-y-2 text-muted">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary/70" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary/70" />
                <span>Joined {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Password Change */}
          <div className="lg:col-span-2 card bg-surface border border-muted/30">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-muted/20">
              <Lock size={24} className="text-primary" />
              <h3 className="text-2xl font-bold">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">Current Password *</label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, oldPassword: e.target.value })
                    }
                    placeholder="Enter your current password"
                    className="input-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="text-xs text-danger mt-1">{passwordErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">New Password *</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Enter your new password"
                    className="input-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-danger mt-1">{passwordErrors.newPassword}</p>
                )}
                <p className="text-xs text-muted mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm your new password"
                    className="input-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-danger mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {passwordErrors.submit && (
                <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {passwordErrors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-6"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>

          {/* Account Info Card */}
          <div className="card bg-surface border border-muted/30">
            <h3 className="text-xl font-bold mb-6 pb-4 border-b border-muted/20">Account Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted font-semibold mb-1">Full Name</p>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-semibold mb-1">Email Address</p>
                <p className="text-sm font-medium break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-semibold mb-1">Member Since</p>
                <p className="text-sm font-medium">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blogs Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8">My Blogs ({blogs?.length || 0})</h2>

          {isError && (
            <div className="bg-danger bg-opacity-10 text-danger p-6 rounded-lg mb-8">
              <p>Error loading your blogs: {error?.message}</p>
            </div>
          )}

          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <div key={blog._id} className="fade-in">
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <User size={48} className="mx-auto text-muted mb-4 opacity-50" />
              <p className="text-lg text-muted mb-2">You haven't created any blogs yet</p>
              <p className="text-sm text-muted">Start sharing your ideas with our community!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
