import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Vote from '../models/Vote.js';
import Tag from '../models/Tag.js';
import Notification from '../models/Notification.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all questions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sort').optional().isIn(['newest', 'votes', 'answers', 'views']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';

    // Build query
    let query = { isDeleted: false };

    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'votes':
        sortOption = { votes: -1, createdAt: -1 };
        break;
      case 'answers':
        sortOption = { answersCount: -1, createdAt: -1 };
        break;
      case 'views':
        sortOption = { views: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username reputation')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username reputation'
        }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single question by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation avatar')
      .populate({
        path: 'answers',
        populate: [
          {
            path: 'author',
            select: 'username reputation avatar'
          },
          {
            path: 'comments',
            populate: {
              path: 'author',
              select: 'username reputation avatar'
            }
          }
        ]
      });

    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count (but not for the author)
    if (!req.user || req.user._id.toString() !== question.author._id.toString()) {
      await question.incrementViews();
    }

    res.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new question
router.post('/', authenticateToken, [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('tags')
    .isArray({ min: 1, max: 5 })
    .withMessage('Must provide 1-5 tags')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, tags } = req.body;

    // Create question
    const question = new Question({
      title,
      description,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      author: req.user._id
    });

    await question.save();

    // Update tag counts
    for (const tagName of question.tags) {
      await Tag.findOneAndUpdate(
        { name: tagName },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    }

    // Populate author info
    await question.populate('author', 'username reputation avatar');

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on question
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
    const questionId = req.params.id;
    const userId = req.user._id;

    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is trying to vote on their own question
    if (question.author.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot vote on your own question' });
    }

    // Check existing vote
    const existingVote = await Vote.findOne({
      userId,
      targetId: questionId,
      targetType: 'question'
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
        targetId: questionId,
        targetType: 'question',
        type
      });
      voteChange = type === 'upvote' ? 1 : -1;
    }

    // Update question vote count
    question.votes += voteChange;
    await question.save();

    res.json({
      message: 'Vote recorded successfully',
      votes: question.votes
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create answer for question
router.post('/:id/answers', authenticateToken, [
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
    const questionId = req.params.id;

    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Create answer
    const answer = new Answer({
      content,
      author: req.user._id,
      questionId
    });

    await answer.save();
    await answer.populate('author', 'username reputation avatar');

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: question.author,
        type: 'answer',
        message: `${req.user.username} answered your question: ${question.title}`,
        relatedId: answer._id,
        relatedType: 'answer',
        triggeredBy: req.user._id
      });
    }

    res.status(201).json({
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;