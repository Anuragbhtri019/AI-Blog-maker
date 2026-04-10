import { User } from "../models/User.js";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import logger from "../utils/logger.js";

/**
 * Register new user
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Create new user
  const user = new User({ name, email, password });
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  logger.info(`New user registered: ${email}`, { userId: user._id });

  res.status(201).json({
    message: "User registered successfully",
    user: user.toJSON(),
    token,
    refreshToken,
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and select password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    logger.warn(`Login attempt with non-existent email: ${email}`, { ip: req.ip });
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn(`Failed login attempt for user: ${email}`, {
      userId: user._id,
      ip: req.ip
    });
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  logger.info(`Successful login: ${email}`, { userId: user._id });

  res.status(200).json({
    message: "Login successful",
    user: user.toJSON(),
    token,
    refreshToken,
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    logger.info(`Token refreshed for user: ${user.email}`, { userId: user._id });

    res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.warn(`Invalid refresh token attempt`, {
      ip: req.ip,
      error: error.message
    });
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

/**
 * Change user password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.userId; // From auth middleware

  // Validate input
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({ message: "New password must be different from old password" });
  }

  // Get user with password field
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Verify old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    logger.warn(`Failed password change attempt for user: ${user.email}`, { userId: user._id });
    return res.status(401).json({ message: "Old password is incorrect" });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`, { userId: user._id });

  res.status(200).json({
    message: "Password changed successfully",
    user: user.toJSON(),
  });
});

/**
 * Upload profile image
 */
export const uploadProfileImage = asyncHandler(async (req, res) => {
  const userId = req.userId; // From auth middleware

  // Check if image was processed
  if (!req.imageUrl) {
    return res.status(400).json({ message: "No image provided or processing failed" });
  }

  // Update user's profile image
  const user = await User.findByIdAndUpdate(
    userId,
    { profileImage: req.imageUrl },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  logger.info(`Profile image updated for user: ${user.email}`, { userId: user._id });

  res.status(200).json({
    message: "Profile image updated successfully",
    user: user.toJSON(),
    profileImage: req.imageUrl,
  });
});
