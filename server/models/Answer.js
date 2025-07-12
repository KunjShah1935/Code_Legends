import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    minlength: [10, 'Answer must be at least 10 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
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

// Virtual for comments
answerSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'answerId',
  match: { isDeleted: false }
});

// Indexes for better query performance
answerSchema.index({ questionId: 1 });
answerSchema.index({ author: 1 });
answerSchema.index({ votes: -1 });
answerSchema.index({ createdAt: -1 });
answerSchema.index({ isAccepted: -1 });

// Ensure only one accepted answer per question
answerSchema.pre('save', async function(next) {
  if (this.isAccepted && this.isModified('isAccepted')) {
    // Unaccept other answers for this question
    await this.constructor.updateMany(
      { 
        questionId: this.questionId, 
        _id: { $ne: this._id },
        isAccepted: true 
      },
      { isAccepted: false }
    );
    
    // Update the question's acceptedAnswer field
    await mongoose.model('Question').findByIdAndUpdate(
      this.questionId,
      { acceptedAnswer: this._id }
    );
  }
  next();
});

export default mongoose.model('Answer', answerSchema);