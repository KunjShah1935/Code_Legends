const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'quiz.db'));

// Ensure tables exist before deleting or inserting
// Users
// Quizzes
// Questions
// Responses
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student'
);
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER,
  question_text TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_option INTEGER NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER,
  user_id INTEGER,
  answers TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

db.exec(`DELETE FROM questions; DELETE FROM quizzes; DELETE FROM users;`);

// Insert a teacher user for quiz ownership
const teacherEmail = 'teacher@example.com';
const teacherPassword = 'password';
const bcrypt = require('bcryptjs');
const hashed = bcrypt.hashSync(teacherPassword, 10);
db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(teacherEmail, hashed, 'teacher');
const teacherId = db.prepare('SELECT id FROM users WHERE email = ?').get(teacherEmail).id;

// Insert quizzes
const quizzes = [
  { id: 1, title: 'Beginner Quiz', description: 'A quiz for beginners', created_by: teacherId },
  { id: 2, title: 'General Knowledge Quiz', description: 'Test your general knowledge', created_by: teacherId },
  { id: 3, title: 'Advanced Quiz', description: 'A quiz for advanced users', created_by: teacherId },
];

for (const quiz of quizzes) {
  db.prepare('INSERT INTO quizzes (id, title, description, created_by) VALUES (?, ?, ?, ?)').run(quiz.id, quiz.title, quiz.description, quiz.created_by);
}

// Insert questions for each quiz
const questions = [
  // Beginner Quiz (id: 1)
  { quiz_id: 1, question_text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct_option: 1 },
  { quiz_id: 1, question_text: 'What color is the sky?', options: ['Blue', 'Green', 'Red', 'Yellow'], correct_option: 0 },
  { quiz_id: 1, question_text: 'Which is a fruit?', options: ['Carrot', 'Potato', 'Apple', 'Broccoli'], correct_option: 2 },
  // General Knowledge Quiz (id: 2)
  { quiz_id: 2, question_text: 'Who wrote Hamlet?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], correct_option: 1 },
  { quiz_id: 2, question_text: 'What is the capital of France?', options: ['Berlin', 'London', 'Paris', 'Rome'], correct_option: 2 },
  { quiz_id: 2, question_text: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correct_option: 1 },
  // Advanced Quiz (id: 3)
  { quiz_id: 3, question_text: 'What is the derivative of x^2?', options: ['x', '2x', 'x^2', '2'], correct_option: 1 },
  { quiz_id: 3, question_text: 'Who developed the theory of relativity?', options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Marie Curie'], correct_option: 1 },
  { quiz_id: 3, question_text: 'What is the chemical symbol for gold?', options: ['Au', 'Ag', 'Gd', 'Go'], correct_option: 0 },
];

for (const q of questions) {
  db.prepare('INSERT INTO questions (quiz_id, question_text, options, correct_option) VALUES (?, ?, ?, ?)')
    .run(q.quiz_id, q.question_text, JSON.stringify(q.options), q.correct_option);
}

console.log('Database seeded with mock quizzes, questions, and a teacher user.'); 