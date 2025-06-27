const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticate, requireTeacher } = require('../middleware/auth');

const questionSchema = Joi.object({
  quiz_id: Joi.number().required(),
  question_text: Joi.string().required(),
  options: Joi.array().items(Joi.string()).min(2).required(),
  correct_option: Joi.number().integer().min(0).required(),
});

// Add a question to a quiz (teacher only)
router.post('/', authenticate, requireTeacher, async (req, res) => {
  const db = req.app.locals.db;
  const { error } = questionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { quiz_id, question_text, options, correct_option } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO questions (quiz_id, question_text, options, correct_option) VALUES (?, ?, ?, ?)');
    const info = stmt.run(quiz_id, question_text, JSON.stringify(options), correct_option);
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(info.lastInsertRowid);
    question.options = JSON.parse(question.options);
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Get questions for a quiz
router.get('/:quiz_id', (req, res) => {
  const db = req.app.locals.db;
  const { quiz_id } = req.params;
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz_id);
  questions.forEach(q => q.options = JSON.parse(q.options));
  res.json(questions);
});

module.exports = router; 