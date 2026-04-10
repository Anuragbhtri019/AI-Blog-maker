import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * Send a message to blog author (requires authentication)
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { subject, content, recipientId, blogId } = req.body;
  const senderId = req.userId;

  if (!subject || !content || !recipientId) {
    return res.status(400).json({ message: 'Please provide subject, content, and recipient ID' });
  }

  // Verify recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  // Verify blog exists if provided
  if (blogId) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
  }

  // Prevent self-messaging
  if (senderId === recipientId) {
    return res.status(400).json({ message: 'Cannot send message to yourself' });
  }

  const message = new Message({
    subject,
    content,
    sender: senderId,
    recipient: recipientId,
    blog: blogId || null,
  });

  await message.save();

  res.status(201).json({
    message: 'Message sent successfully',
    data: message,
  });
});

/**
 * Get received messages for logged-in user
 */
export const getReceivedMessages = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 0, limit = 10, isRead } = req.query;
  const skip = parseInt(page) * parseInt(limit);

  const filter = { recipient: userId };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('sender', 'name email')
    .populate('blog', 'title');

  const total = await Message.countDocuments(filter);

  res.status(200).json({
    messages,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * Get sent messages for logged-in user
 */
export const getSentMessages = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 0, limit = 10 } = req.query;
  const skip = parseInt(page) * parseInt(limit);

  const messages = await Message.find({ sender: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('recipient', 'name email')
    .populate('blog', 'title');

  const total = await Message.countDocuments({ sender: userId });

  res.status(200).json({
    messages,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * Mark message as read
 */
export const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user is the recipient
  if (message.recipient.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized to mark this message' });
  }

  message.isRead = true;
  await message.save();

  res.status(200).json({
    message: 'Message marked as read',
    data: message,
  });
});

/**
 * Delete a message
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user is sender or recipient
  if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized to delete this message' });
  }

  await Message.findByIdAndDelete(messageId);

  res.status(200).json({ message: 'Message deleted successfully' });
});

/**
 * Get unread message count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const unreadCount = await Message.countDocuments({
    recipient: userId,
    isRead: false,
  });

  res.status(200).json({ unreadCount });
});
