import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Tag from '../models/Tag.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit';

const sampleUsers = [
  {
    username: 'john_dev',
    email: 'john@example.com',
    password: 'password123',
    reputation: 1250,
    bio: 'Full-stack developer with 5 years of experience in React and Node.js'
  },
  {
    username: 'sarah_coder',
    email: 'sarah@example.com',
    password: 'password123',
    reputation: 890,
    bio: 'Frontend specialist, love working with modern JavaScript frameworks'
  },
  {
    username: 'mike_backend',
    email: 'mike@example.com',
    password: 'password123',
    reputation: 2100,
    bio: 'Backend engineer focused on scalable systems and databases'
  },
  {
    username: 'admin',
    email: 'admin@stackit.com',
    password: 'admin123',
    reputation: 5000,
    role: 'admin',
    bio: 'Platform administrator and senior developer'
  }
];

const sampleTags = [
  { name: 'javascript', description: 'Programming language for web development', count: 45 },
  { name: 'react', description: 'JavaScript library for building user interfaces', count: 32 },
  { name: 'node.js', description: 'JavaScript runtime for server-side development', count: 28 },
  { name: 'python', description: 'High-level programming language', count: 38 },
  { name: 'mongodb', description: 'NoSQL document database', count: 22 },
  { name: 'express', description: 'Web framework for Node.js', count: 18 },
  { name: 'css', description: 'Styling language for web pages', count: 25 },
  { name: 'html', description: 'Markup language for web pages', count: 20 },
  { name: 'typescript', description: 'Typed superset of JavaScript', count: 30 },
  { name: 'api', description: 'Application Programming Interface', count: 35 }
];

const sampleQuestions = [
  {
    title: 'How to handle async/await in React components?',
    description: '<p>I\'m trying to fetch data from an API in my React component using async/await, but I\'m getting errors. Here\'s my code:</p><pre><code>const MyComponent = async () => {\n  const data = await fetch(\'/api/data\');\n  return &lt;div&gt;{data}&lt;/div&gt;;\n};</code></pre><p>What\'s the correct way to handle asynchronous operations in React?</p>',
    tags: ['react', 'javascript', 'api'],
    votes: 15,
    views: 234
  },
  {
    title: 'MongoDB aggregation pipeline for complex queries',
    description: '<p>I need to create a complex aggregation pipeline in MongoDB that:</p><ul><li>Groups documents by category</li><li>Calculates average ratings</li><li>Filters results with rating > 4.0</li><li>Sorts by creation date</li></ul><p>Can someone help me structure this pipeline correctly?</p>',
    tags: ['mongodb', 'aggregation', 'database'],
    votes: 8,
    views: 156
  },
  {
    title: 'Best practices for Node.js error handling',
    description: '<p>What are the recommended patterns for error handling in Node.js applications? I\'m particularly interested in:</p><ul><li>Global error handlers</li><li>Promise rejection handling</li><li>Express middleware for errors</li></ul><p>Any examples would be greatly appreciated!</p>',
    tags: ['node.js', 'express', 'error-handling'],
    votes: 22,
    views: 445
  },
  {
    title: 'TypeScript generic constraints with interfaces',
    description: '<p>I\'m struggling with TypeScript generics and constraints. How can I create a generic function that accepts only objects implementing a specific interface?</p><pre><code>interface HasId {\n  id: string;\n}\n\nfunction processItem&lt;T&gt;(item: T): T {\n  // How to ensure T extends HasId?\n  return item;\n}</code></pre>',
    tags: ['typescript', 'generics', 'interfaces'],
    votes: 12,
    views: 189
  },
  {
    title: 'CSS Grid vs Flexbox: When to use which?',
    description: '<p>I\'m confused about when to use CSS Grid versus Flexbox for layouts. Can someone explain:</p><ul><li>The main differences</li><li>Use cases for each</li><li>Performance considerations</li><li>Browser support</li></ul><p>Examples would be helpful!</p>',
    tags: ['css', 'layout', 'grid', 'flexbox'],
    votes: 18,
    views: 567
  }
];

const sampleAnswers = [
  {
    content: '<p>React components cannot be async functions directly. Instead, you should use the <code>useEffect</code> hook for side effects like API calls:</p><pre><code>import { useState, useEffect } from \'react\';\n\nconst MyComponent = () => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      try {\n        const response = await fetch(\'/api/data\');\n        const result = await response.json();\n        setData(result);\n      } catch (error) {\n        console.error(\'Error fetching data:\', error);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchData();\n  }, []);\n\n  if (loading) return &lt;div&gt;Loading...&lt;/div&gt;;\n  \n  return &lt;div&gt;{JSON.stringify(data)}&lt;/div&gt;;\n};</code></pre><p>This pattern ensures proper error handling and loading states.</p>',
    votes: 25,
    isAccepted: true
  },
  {
    content: '<p>Here\'s a MongoDB aggregation pipeline that meets your requirements:</p><pre><code>db.collection.aggregate([\n  {\n    $group: {\n      _id: "$category",\n      averageRating: { $avg: "$rating" },\n      count: { $sum: 1 },\n      documents: { $push: "$$ROOT" }\n    }\n  },\n  {\n    $match: {\n      averageRating: { $gt: 4.0 }\n    }\n  },\n  {\n    $sort: {\n      "documents.createdAt": -1\n    }\n  }\n]);</code></pre><p>This pipeline groups by category, calculates averages, filters by rating, and sorts by creation date.</p>',
    votes: 12
  },
  {
    content: '<p>For comprehensive error handling in Node.js, I recommend this approach:</p><h3>1. Global Error Handler</h3><pre><code>process.on(\'uncaughtException\', (error) => {\n  console.error(\'Uncaught Exception:\', error);\n  process.exit(1);\n});\n\nprocess.on(\'unhandledRejection\', (reason, promise) => {\n  console.error(\'Unhandled Rejection at:\', promise, \'reason:\', reason);\n  process.exit(1);\n});</code></pre><h3>2. Express Error Middleware</h3><pre><code>app.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ message: \'Something went wrong!\' });\n});</code></pre><h3>3. Async Route Wrapper</h3><pre><code>const asyncHandler = (fn) => (req, res, next) => {\n  Promise.resolve(fn(req, res, next)).catch(next);\n};</code></pre>',
    votes: 18,
    isAccepted: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Tag.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      users.push(user);
    }
    console.log('👥 Created sample users');

    // Create tags
    for (const tagData of sampleTags) {
      const tag = new Tag(tagData);
      await tag.save();
    }
    console.log('🏷️  Created sample tags');

    // Create questions and answers
    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];
      const author = users[i % users.length];
      
      const question = new Question({
        ...questionData,
        author: author._id
      });
      
      await question.save();

      // Add answer if available
      if (sampleAnswers[i]) {
        const answerAuthor = users[(i + 1) % users.length];
        const answer = new Answer({
          ...sampleAnswers[i],
          author: answerAuthor._id,
          questionId: question._id
        });
        
        await answer.save();
        
        if (answer.isAccepted) {
          question.acceptedAnswer = answer._id;
          await question.save();
        }
      }
    }
    console.log('❓ Created sample questions and answers');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Tags: ${sampleTags.length}`);
    console.log(`   Questions: ${sampleQuestions.length}`);
    console.log(`   Answers: ${sampleAnswers.length}`);
    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@stackit.com / admin123');
    console.log('   User: john@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();