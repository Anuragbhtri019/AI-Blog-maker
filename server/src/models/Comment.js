import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please provide comment content'],
      trim: true,
      minlength: [1, 'Comment must not be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    // Content type - only blogs (no more vlogs)
    contentType: {
      type: String,
      enum: ['blog'],
      default: 'blog',
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    // Keep blog field for backward compatibility
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Indexes for faster queries
 */
commentSchema.index({ contentId: 1, contentType: 1, createdAt: -1 });
commentSchema.index({ blog: 1, createdAt: -1 }); // For backward compatibility
commentSchema.index({ author: 1 });

/**
 * Populate author before returning
 */
commentSchema.pre(/^find/, function (next) {
  if (this.options._recursed) return next();

  this.populate({
    path: 'author',
    select: 'name email',
  });

  next();
});

/**
 * Pre-save hook to set contentId from blog field if not set (backward compatibility)
 */
commentSchema.pre('save', function (next) {
  if (this.blog && !this.contentId) {
    this.contentId = this.blog;
  }
  next();
});

/**
 * Comment model
 */
export const Comment = mongoose.model('Comment', commentSchema);
