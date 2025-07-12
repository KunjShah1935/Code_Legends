import express from 'express';
import Tag from '../models/Tag.js';
import Question from '../models/Question.js';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find()
      .sort({ count: -1 })
      .limit(100);

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const tags = await Tag.find()
      .sort({ count: -1 })
      .limit(20)
      .select('name count');

    res.json({ tags: tags.map(tag => tag.name) });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tag details with questions
router.get('/:name', async (req, res) => {
  try {
    const tagName = req.params.name.toLowerCase();
    
    const tag = await Tag.findOne({ name: tagName });
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    const questions = await Question.find({ 
      tags: tagName,
      isDeleted: false 
    })
      .populate('author', 'username reputation')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ 
      tag,
      questions 
    });
  } catch (error) {
    console.error('Get tag details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;