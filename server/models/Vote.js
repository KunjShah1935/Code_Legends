import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['question', 'answer'],
    required: true
  },
  type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per target
voteSchema.index({ userId: 1, targetId: 1 }, { unique: true });
voteSchema.index({ targetId: 1, targetType: 1 });

export default mongoose.model('Vote', voteSchema);