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

// Add a question to a quiz (teachers and students)
router.post('/', authenticate, async (req, res) => {
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

// Delete a question (only quiz creator can delete)
router.delete('/:question_id', authenticate, async (req, res) => {
  const db = req.app.locals.db;
  const { question_id } = req.params;
  const user_id = req.user.id;
  
  try {
    // First check if the question exists and get its quiz_id
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if the user is the creator of the quiz
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(question.quiz_id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quiz.created_by !== user_id) {
      return res.status(403).json({ error: 'Only the quiz creator can delete questions' });
    }
    
    // Delete the question
    const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
    stmt.run(question_id);
    
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error in delete endpoint:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Get questions for a quiz
router.get('/:quiz_id', (req, res) => {
  const db = req.app.locals.db;
  const { quiz_id } = req.params;
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz_id);
  questions.forEach(q => q.options = JSON.parse(q.options));
  // Fetch quiz meta info
  const quiz = db.prepare('SELECT id, title, description, time_per_question FROM quizzes WHERE id = ?').get(quiz_id);
  res.json({ quiz, questions });
});

module.exports = router; 