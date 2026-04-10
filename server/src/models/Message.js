import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide message content'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Index for faster queries
 */
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

/**
 * Populate sender and recipient before returning
 */
messageSchema.pre(/^find/, function (next) {
  if (this.options._recursed) return next();

  this.populate({
    path: 'sender',
    select: 'name email',
  }).populate({
    path: 'recipient',
    select: 'name email',
  });

  next();
});

/**
 * Message model
 */
export const Message = mongoose.model('Message', messageSchema);
