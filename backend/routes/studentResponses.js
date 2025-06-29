const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get user's own responses (student) - robust version
router.get('/mine', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const user_id = req.user.id;
  // Get all responses for this user
  const responses = db.prepare('SELECT * FROM responses WHERE user_id = ? ORDER BY submitted_at DESC').all(user_id);
  // For each response, get quiz title and calculate score
  const results = responses.map(r => {
    const quiz = db.prepare('SELECT title FROM quizzes WHERE id = ?').get(r.quiz_id);
    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(r.quiz_id);
    let score = 0;
    const answers = JSON.parse(r.answers);
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correct_option) {
        score++;
      }
    });
    return {
      quiz_id: r.quiz_id,
      quiz_title: quiz ? quiz.title : 'Unknown Quiz',
      score: score,
      total_questions: questions.length,
      submitted_at: r.submitted_at
    };
  });
  res.json(results);
});

module.exports = router; 