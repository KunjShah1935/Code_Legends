const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticate, requireTeacher } = require('../middleware/auth');

const responseSchema = Joi.object({
  quiz_id: Joi.number().required(),
  answers: Joi.array().items(Joi.number().integer()).required(),
});

// Submit a response (auth required)
router.post('/', authenticate, async (req, res) => {
  const db = req.app.locals.db;
  const { error } = responseSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { quiz_id, answers } = req.body;
  const user_id = req.user.id;
  try {
    const stmt = db.prepare('INSERT INTO responses (quiz_id, user_id, answers) VALUES (?, ?, ?)');
    const info = stmt.run(quiz_id, user_id, JSON.stringify(answers));
    const response = db.prepare('SELECT * FROM responses WHERE id = ?').get(info.lastInsertRowid);
    response.answers = JSON.parse(response.answers);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get responses for a quiz (auth required, only for this user)
router.get('/:quiz_id', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const { quiz_id } = req.params;
  const user_id = req.user.id;
  const responses = db.prepare('SELECT * FROM responses WHERE quiz_id = ? AND user_id = ?').all(quiz_id, user_id);
  responses.forEach(r => r.answers = JSON.parse(r.answers));
  res.json(responses);
});

// Get all responses for a quiz (teacher only)
router.get('/all/:quiz_id', authenticate, requireTeacher, (req, res) => {
  const db = req.app.locals.db;
  const { quiz_id } = req.params;
  const responses = db.prepare('SELECT * FROM responses WHERE quiz_id = ?').all(quiz_id);
  responses.forEach(r => r.answers = JSON.parse(r.answers));
  res.json(responses);
});

module.exports = router; 