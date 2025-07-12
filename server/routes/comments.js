import express from 'express';
import { body, validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create comment on answer
router.post('/', authenticateToken, [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('answerId')
    .isMongoId()
    .withMessage('Valid answer ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, answerId } = req.body;

    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user._id,
      answerId
    });

    await comment.save();
    await comment.populate('author', 'username reputation avatar');

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: answer.author,
        type: 'comment',
        message: `${req.user.username} commented on your answer`,
        relatedId: comment._id,
        relatedType: 'comment',
        triggeredBy: req.user._id
      });
    }

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author or admin
    if (comment.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Can only delete your own comments' });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;