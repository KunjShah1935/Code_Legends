import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Users, Award } from 'lucide-react';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Question } from '../types';
import { questionsAPI, tagsAPI } from '../lib/api';
import { generateTagColor } from '../lib/utils';

export function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'unanswered'>('newest');

  useEffect(() => {
    fetchQuestions();
    fetchPopularTags();
  }, [sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll(1, 10);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await tagsAPI.getPopular();
      setPopularTags(response.data.tags.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
    }
  };

  const stats = [
    { label: 'Questions', value: '12.5K', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Answers', value: '28.3K', icon: Clock, color: 'text-green-600' },
    { label: 'Users', value: '3.2K', icon: Users, color: 'text-purple-600' },
    { label: 'Reputation', value: '156K', icon: Award, color: 'text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 glow-effect hover:shadow-glow-lg floating relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 animate-pulse"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4 gradient-text text-white animate-bounce-slow">Welcome to StackIt</h1>
            <p className="text-blue-100 mb-6 text-lg">
              A minimal Q&A platform for collaborative learning and knowledge sharing.
              Ask questions, share knowledge, and grow together.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/ask">
                <Button variant="secondary" size="lg" className="button-hover hover:shadow-glow-md">
                  Ask Your First Question
                </Button>
              </Link>
              <Link to="/questions">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 button-hover hover:shadow-glow-md">
                  Browse Questions
                </Button>
              </Link>
            </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover glow-effect group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-125 group-hover:rotate-12 transition-all duration-300`} />
                </div>
              </div>
            ))}
          </div>

          {/* Questions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Questions</h2>
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === 'newest' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('newest')}
                  className="button-hover"
                >
                  Newest
                </Button>
                <Button
                  variant={sortBy === 'trending' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('trending')}
                  className="button-hover"
                >
                  Trending
                </Button>
                <Button
                  variant={sortBy === 'unanswered' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('unanswered')}
                  className="button-hover"
                >
                  Unanswered
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No questions yet. Be the first to ask!</p>
                <Link to="/ask">
                  <Button variant="primary" className="button-hover">Ask a Question</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.slice(0, 5).map((question) => (
                  <QuestionCard
                    key={question._id}
                    question={question}
                    showVoting={false}
                  />
                ))}
                <div className="text-center pt-4">
                  <Link to="/questions">
                    <Button variant="outline" className="button-hover">View All Questions</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link key={tag} to={`/questions?tag=${tag}`}>
                  <Badge className={`${generateTagColor(tag)} hover:opacity-80 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-glow-sm`}>
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/ask" className="block">
                <Button variant="outline" className="w-full justify-start button-hover">
                  Ask a Question
                </Button>
              </Link>
              <Link to="/questions" className="block">
                <Button variant="outline" className="w-full justify-start button-hover">
                  Browse Questions
                </Button>
              </Link>
              <Link to="/tags" className="block">
                <Button variant="outline" className="w-full justify-start button-hover">
                  Explore Tags
                </Button>
              </Link>
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 card-hover">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">Community Guidelines</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Be respectful and constructive</li>
              <li>• Search before asking</li>
              <li>• Provide clear, detailed questions</li>
              <li>• Accept helpful answers</li>
              <li>• Vote on quality content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}