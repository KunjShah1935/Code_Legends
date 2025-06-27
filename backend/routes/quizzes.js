const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticate, requireTeacher } = require('../middleware/auth');

const quizSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
});

// Create a quiz (teacher only)
router.post('/', authenticate, requireTeacher, async (req, res) => {
  const db = req.app.locals.db;
  const { error } = quizSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { title, description } = req.body;
  const created_by = req.user.id;
  try {
    const stmt = db.prepare('INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)');
    const info = stmt.run(title, description, created_by);
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(info.lastInsertRowid);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Get all quizzes
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const quizzes = db.prepare('SELECT * FROM quizzes').all();
  res.json(quizzes);
});

module.exports = router;