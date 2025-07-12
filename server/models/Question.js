import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  tags: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    maxlength: [30, 'Tag must be less than 30 characters']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for answers
questionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'questionId',
  match: { isDeleted: false }
});

// Indexes for better query performance
questionSchema.index({ author: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ votes: -1 });
questionSchema.index({ views: -1 });
questionSchema.index({ title: 'text', description: 'text' });

// Validation for tags
questionSchema.pre('save', function(next) {
  if (this.tags.length === 0) {
    return next(new Error('At least one tag is required'));
  }
  if (this.tags.length > 5) {
    return next(new Error('Maximum 5 tags allowed'));
  }
  
  // Remove duplicates and empty tags
  this.tags = [...new Set(this.tags.filter(tag => tag.trim()))];
  next();
});

// Method to increment views
questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

export default mongoose.model('Question', questionSchema);