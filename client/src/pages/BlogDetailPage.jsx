import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { formatDate, bufferToImageUrl, estimateReadingTime } from '../lib/utils';
import {
  Loader2,
  ArrowLeft,
  Zap,
  Trash2,
  AlertCircle,
  Send,
  MessageSquare,
  Trash as TrashIcon,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Single blog detail page with beautiful reading layout
 */
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);

  /**
   * Fetch single blog
   */
  const {
    data: blog,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/${id}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  /**
   * Fetch comments for the blog
   */
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', blog?._id],
    queryFn: async () => {
      const response = await apiClient.get(`/comments/blog/${blog?._id}`);
      return response.data;
    },
    enabled: !!blog?._id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Delete blog mutation
   */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/blogs/${blog?._id}`);
    },
    onSuccess: () => {
      navigate('/');
    },
    onError: err => {
      setError(err.response?.data?.message || 'Failed to delete blog');
    },
  });

  /**
   * Create comment mutation
   */
  const createCommentMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/comments`, {
        content: commentContent,
        blogId: blog?._id,
      });
    },
    onSuccess: () => {
      setCommentContent('');
      refetchComments();
    },
    onError: err => {
      setError(err.response?.data?.message || 'Failed to post comment');
    },
  });

  /**
   * Delete comment mutation
   */
  const deleteCommentMutation = useMutation({
    mutationFn: async commentId => {
      await apiClient.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      refetchComments();
    },
    onError: err => {
      setError(err.response?.data?.message || 'Failed to delete comment');
    },
  });

  /**
   * Send message mutation
   */
  const sendMessageMutation = useMutation({
    mutationFn: async ({ subject, content }) => {
      await apiClient.post(`/messages`, {
        subject,
        content,
        recipientId: blog.author._id,
        blogId: id,
      });
    },
    onSuccess: () => {
      setShowMessageForm(false);
      alert('Message sent successfully!');
    },
    onError: err => {
      setError(err.response?.data?.message || 'Failed to send message');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      deleteMutation.mutate();
    }
  };

  const handlePostComment = () => {
    if (!user) {
      setError('You must be logged in to post a comment');
      return;
    }
    if (commentContent.trim()) {
      createCommentMutation.mutate();
    }
  };

  const handleDeleteComment = commentId => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="btn-secondary px-4 py-2 inline-flex items-center gap-2 mb-8">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="bg-danger bg-opacity-10 text-danger p-6 rounded-lg">
            <p>Error loading blog: {fetchError?.message || 'Blog not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = blog.imageUrl || (blog.image ? bufferToImageUrl(blog.image) : null);
  const readingTime = estimateReadingTime(blog.content);
  const isAuthor = user?._id === blog.author?._id;
  const displayAuthorName =
    blog.author?.name === 'VibeBlog AI' ? 'Admin' : blog.author?.name || 'Anonymous';

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <Link to="/" className="btn-secondary px-4 py-2 inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>

      {/* Main content */}
      <article className="reading-container">
        {/* Error message */}
        {error && (
          <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-lg flex items-center gap-3 mb-8">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Featured image */}
        {imageUrl && (
          <div className="mb-12 -mx-6 md:mx-0">
            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full h-96 md:h-[500px] object-cover md:rounded-2xl"
              loading="lazy"
            />
            {/* Unsplash Attribution - Required for production compliance */}
            {blog.unsplashAttribution && (
              <div className="mt-3 text-sm text-muted">
                <p>
                  Photo by{' '}
                  <a
                    href={blog.unsplashAttribution.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {blog.unsplashAttribution.photographerName}
                  </a>{' '}
                  on{' '}
                  <a
                    href={blog.unsplashAttribution.unsplashUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Unsplash
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Badges and meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="badge badge-primary">{blog.category}</span>
          <span className="text-sm text-muted">{readingTime} min read</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text">{blog.title}</h1>

        {/* Author and date */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 border-b border-muted mb-8">
          <div>
            <p className="text-sm text-muted">By {displayAuthorName}</p>
            <p className="text-sm text-muted">{formatDate(blog.createdAt)}</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2">
            {!isAuthor && user && (
              <button
                onClick={() => setShowMessageForm(!showMessageForm)}
                className="btn-secondary px-4 py-2 flex items-center gap-2"
              >
                <Mail size={16} />
                Contact Author
              </button>
            )}

            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-secondary px-4 py-2 flex items-center gap-2 text-danger"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="article-text prose prose-invert max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="bg-surface px-2 py-1 rounded text-sm font-mono" {...props} />
                ) : (
                  <pre className="bg-surface p-4 rounded-lg overflow-x-auto mb-4">
                    <code {...props} />
                  </pre>
                ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-primary pl-4 py-2 italic text-muted mb-4"
                  {...props}
                />
              ),
              a: ({ node, ...props }) => (
                <a className="text-primary hover:underline transition-colors" {...props} />
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* Divider */}
        <div className="border-t border-muted py-8" />

        {/* Author info and Contact */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 mb-12">
          <h3 className="text-lg font-bold mb-2">About the Author</h3>
          <p className="text-muted mb-4">{displayAuthorName}</p>
          {!isAuthor && user && (
            <button
              onClick={() => setShowMessageForm(!showMessageForm)}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Send size={14} />
              Send Message
            </button>
          )}
        </div>

        {/* Message Form */}
        {showMessageForm && user && !isAuthor && (
          <MessageFormModal
            blogAuthorId={blog.author._id}
            onClose={() => setShowMessageForm(false)}
            onSuccess={() => {
              setShowMessageForm(false);
              alert('Message sent successfully!');
            }}
            sendMessageMutation={sendMessageMutation}
          />
        )}

        {/* Comments Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare size={24} />
            Comments ({commentsData?.total || 0})
          </h2>

          {/* Comment Form - Only for logged-in users */}
          {user ? (
            <div className="bg-surface rounded-2xl p-6 mb-8">
              <h3 className="font-bold mb-4">Add a Comment</h3>
              <textarea
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-background border border-muted rounded-lg p-3 text-text placeholder-muted mb-3 resize-none"
                rows="4"
              />
              <button
                onClick={handlePostComment}
                disabled={createCommentMutation.isPending || !commentContent.trim()}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                {createCommentMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-surface bg-opacity-50 border border-primary border-opacity-30 rounded-2xl p-6 mb-8">
              <p className="text-muted mb-4">
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>{' '}
                to post a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : commentsData?.comments && commentsData.comments.length > 0 ? (
            <div className="space-y-4">
              {commentsData.comments.map(comment => (
                <div key={comment._id} className="bg-surface rounded-lg p-4 border border-muted">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-text">{comment.author?.name}</p>
                      <p className="text-xs text-muted">{formatDate(comment.createdAt)}</p>
                    </div>
                    {user?._id === comment.author?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-danger hover:bg-danger hover:bg-opacity-10 p-2 rounded transition-colors"
                      >
                        {deleteCommentMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <TrashIcon size={16} />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-muted">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

/**
 * Message Form Modal Component
 */
function MessageFormModal({ blogAuthorId, onClose, sendMessageMutation }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (subject.trim() && content.trim()) {
      sendMessageMutation.mutate(
        { subject, content },
        {
          onSuccess: () => {
            setSubject('');
            setContent('');
            onClose();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Send Message to Author</h2>

        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full bg-background border border-muted rounded-lg p-3 text-text placeholder-muted mb-4"
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Your message..."
          className="w-full bg-background border border-muted rounded-lg p-3 text-text placeholder-muted mb-4 resize-none"
          rows="6"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary px-6 py-2">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending || !subject.trim() || !content.trim()}
            className="btn-primary px-6 py-2 flex items-center gap-2"
          >
            {sendMessageMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
