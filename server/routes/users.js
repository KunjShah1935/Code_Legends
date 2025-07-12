import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's questions
    const questions = await Question.find({ 
      author: user._id,
      isDeleted: false 
    })
      .populate('author', 'username reputation')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's answers
    const answers = await Answer.find({ 
      author: user._id,
      isDeleted: false 
    })
      .populate('questionId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const stats = {
      questionsCount: await Question.countDocuments({ 
        author: user._id,
        isDeleted: false 
      }),
      answersCount: await Answer.countDocuments({ 
        author: user._id,
        isDeleted: false 
      }),
      acceptedAnswersCount: await Answer.countDocuments({ 
        author: user._id,
        isAccepted: true,
        isDeleted: false 
      })
    };

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        reputation: user.reputation,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      },
      questions,
      answers,
      stats
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top users by reputation
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('username reputation createdAt')
      .sort({ reputation: -1 })
      .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;