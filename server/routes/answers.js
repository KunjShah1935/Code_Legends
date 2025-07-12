import express from 'express';
import { body, validationResult } from 'express-validator';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Vote from '../models/Vote.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Vote on answer
router.post('/:id/vote', authenticateToken, [
  body('type').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type } = req.body;
    const answerId = req.params.id;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is trying to vote on their own answer
    if (answer.author.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot vote on your own answer' });
    }

    // Check existing vote
    const existingVote = await Vote.findOne({
      userId,
      targetId: answerId,
      targetType: 'answer'
    });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        voteChange = type === 'upvote' ? -1 : 1;
      } else {
        // Change vote
        existingVote.type = type;
        await existingVote.save();
        voteChange = type === 'upvote' ? 2 : -2;
      }
    } else {
      // Create new vote
      await Vote.create({
        userId,
        targetId: answerId,
        targetType: 'answer',
        type
      });
      voteChange = type === 'upvote' ? 1 : -1;
    }

    // Update answer vote count
    answer.votes += voteChange;
    await answer.save();

    res.json({
      message: 'Vote recorded successfully',
      votes: answer.votes
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept answer
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.questionId);
    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the question author
    if (question.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Unaccept other answers for this question
    await Answer.updateMany(
      { questionId: answer.questionId, isAccepted: true },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update question's accepted answer
    question.acceptedAnswer = answerId;
    await question.save();

    // Create notification for answer author
    if (answer.author.toString() !== userId.toString()) {
      await Notification.create({
        userId: answer.author,
        type: 'accepted',
        message: `Your answer was accepted for: ${question.title}`,
        relatedId: answerId,
        relatedType: 'answer',
        triggeredBy: userId
      });
    }

    res.json({
      message: 'Answer accepted successfully',
      answer
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update answer
router.put('/:id', authenticateToken, [
  body('content')
    .isLength({ min: 10 })
    .withMessage('Answer must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content } = req.body;
    const answerId = req.params.id;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the answer author
    if (answer.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Can only edit your own answers' });
    }

    answer.content = content;
    await answer.save();

    res.json({
      message: 'Answer updated successfully',
      answer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete answer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the answer author or admin
    if (answer.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Can only delete your own answers' });
    }

    answer.isDeleted = true;
    answer.deletedAt = new Date();
    await answer.save();

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;