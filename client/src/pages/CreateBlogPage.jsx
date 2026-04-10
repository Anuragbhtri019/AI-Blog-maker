import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { Upload, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { formatFileSize } from '../lib/utils';
import { BLOG_CATEGORIES } from '../constants/categories';

const CATEGORIES = BLOG_CATEGORIES;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Create blog page
 */
export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /**
   * Create blog mutation
   */
  const createBlogMutation = useMutation({
    mutationFn: async formData => {
      const response = await apiClient.post('/blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setSuccess('Blog created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    },
    onError: err => {
      setError(err.response?.data?.message || 'Failed to create blog');
    },
  });

  /**
   * Handle image selection
   */
  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      setImage(null);
      setImagePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setImage(null);
      setImagePreview(null);
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Please write some content');
      return;
    }

    if (!image) {
      setError('Please upload an image');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('image', image);

    createBlogMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create a New Blog</h1>
          <p className="text-muted">Share your thoughts with the world</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
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

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Your blog title..."
              className="input-base"
              maxLength={200}
            />
            <p className="text-xs text-muted mt-1">{title.length}/200</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-base">
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-surface text-text">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Featured Image</label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-muted"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-2 bg-danger rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-background transition-all"
              >
                <Upload size={40} className="mx-auto mb-4 text-muted" />
                <p className="text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted">PNG, JPG, WebP (max 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2">Content</label>
            <p className="text-xs text-muted mb-2">Supports Markdown and HTML</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your blog content here... (Markdown supported)&#10;&#10;# Heading&#10;**Bold text**&#10;*Italic text*&#10;[Link](https://example.com)"
              className="input-base font-mono resize-none h-64"
            />
            <p className="text-xs text-muted mt-1">{content.length} characters</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createBlogMutation.isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {createBlogMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Blog'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
