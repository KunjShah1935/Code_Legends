const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticate, requireTeacher } = require('../middleware/auth');

const quizSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  time_per_question: Joi.number().integer().min(5).default(30),
});

// Create a quiz (teachers and students)
router.post('/', authenticate, async (req, res) => {
  const db = req.app.locals.db;
  const { error } = quizSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { title, description, time_per_question } = req.body;
  const created_by = req.user.id;
  try {
    const stmt = db.prepare('INSERT INTO quizzes (title, description, created_by, time_per_question) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, description, created_by, time_per_question);
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(info.lastInsertRowid);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Get all quizzes (only those created by teachers)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  // Only show quizzes created by teachers
  const quizzes = db.prepare('SELECT q.* FROM quizzes q JOIN users u ON q.created_by = u.id WHERE u.role = ?').all('teacher');
  res.json(quizzes);
});

// Get quizzes created by the logged-in user
router.get('/my', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const user_id = req.user.id;
  const quizzes = db.prepare('SELECT * FROM quizzes WHERE created_by = ?').all(user_id);
  res.json(quizzes);
});

// Delete a quiz (only quiz creator can delete)
router.delete('/:quiz_id', authenticate, async (req, res) => {
  const db = req.app.locals.db;
  const { quiz_id } = req.params;
  const user_id = req.user.id;
  
  try {
    // Check if the quiz exists and if the user is the creator
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quiz.created_by !== user_id) {
      return res.status(403).json({ error: 'Only the quiz creator can delete the quiz' });
    }
    
    // Delete all questions for this quiz first (due to foreign key constraint)
    const deleteQuestions = db.prepare('DELETE FROM questions WHERE quiz_id = ?');
    deleteQuestions.run(quiz_id);
    
    // Delete all responses for this quiz
    const deleteResponses = db.prepare('DELETE FROM responses WHERE quiz_id = ?');
    deleteResponses.run(quiz_id);
    
    // Delete the quiz
    const deleteQuiz = db.prepare('DELETE FROM quizzes WHERE id = ?');
    deleteQuiz.run(quiz_id);
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Error in delete quiz endpoint:', err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

module.exports = router;