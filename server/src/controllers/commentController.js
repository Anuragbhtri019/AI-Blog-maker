import { Comment } from '../models/Comment.js';
import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * Create a new comment (requires authentication)
 */
export const createComment = asyncHandler(async (req, res) => {
  const { content, blogId } = req.body;
  const userId = req.userId;

  if (!content || !blogId) {
    return res.status(400).json({ message: 'Please provide content and blog ID' });
  }

  // Verify blog exists
  const blogExists = await Blog.findById(blogId);
  if (!blogExists) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  // Create comment
  const comment = new Comment({
    content,
    contentId: blogId,
    contentType: 'blog',
    blog: blogId,
    author: userId,
  });

  await comment.save();

  res.status(201).json({
    message: 'Comment created successfully',
    comment,
  });
});

/**
 * Get all comments for a blog
 */
export const getComments = asyncHandler(async (req, res) => {
  const { blogId } = req.query;
  const { page = 0, limit = 10 } = req.query;
  const skip = parseInt(page) * parseInt(limit);

  if (!blogId) {
    return res.status(400).json({ message: 'Please provide blog ID' });
  }

  // Verify blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  // Find comments for the blog
  const filter = {
    $or: [
      { blog: blogId },
      { contentId: blogId, contentType: 'blog' }
    ]
  };

  const comments = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'name email');

  const total = await Comment.countDocuments(filter);

  res.status(200).json({
    comments,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * Get all comments for a blog (for backward compatibility)
 */
export const getCommentsByBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { page = 0, limit = 10 } = req.query;
  const skip = parseInt(page) * parseInt(limit);

  // Verify blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  // Support both old and new schema
  const comments = await Comment.find({
    $or: [
      { blog: blogId },
      { contentId: blogId, contentType: 'blog' }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'name email');

  const total = await Comment.countDocuments({
    $or: [
      { blog: blogId },
      { contentId: blogId, contentType: 'blog' }
    ]
  });

  res.status(200).json({
    comments,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * Delete a comment (only author or admin can delete)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  // Check if user is the comment author
  if (comment.author.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized to delete this comment' });
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: 'Comment deleted successfully' });
});

/**
 * Update a comment (only author can update)
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  if (!content) {
    return res.status(400).json({ message: 'Please provide comment content' });
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  // Check if user is the comment author
  if (comment.author.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized to update this comment' });
  }

  comment.content = content;
  await comment.save();

  res.status(200).json({
    message: 'Comment updated successfully',
    comment,
  });
});
