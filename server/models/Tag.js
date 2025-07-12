import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [30, 'Tag name must be less than 30 characters'],
    match: [/^[a-z0-9-+#.]+$/, 'Tag can only contain lowercase letters, numbers, hyphens, plus signs, dots, and hash symbols']
  },
  description: {
    type: String,
    maxlength: [200, 'Description must be less than 200 characters']
  },
  count: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

// Index for better query performance
tagSchema.index({ name: 1 });
tagSchema.index({ count: -1 });

// Method to increment usage count
tagSchema.methods.incrementCount = function() {
  this.count += 1;
  return this.save();
};

// Method to decrement usage count
tagSchema.methods.decrementCount = function() {
  this.count = Math.max(0, this.count - 1);
  return this.save();
};

export default mongoose.model('Tag', tagSchema);