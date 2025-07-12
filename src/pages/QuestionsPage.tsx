import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Question } from '../types';
import { questionsAPI, tagsAPI } from '../lib/api';
import { generateTagColor } from '../lib/utils';

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'answers'>('newest');
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tag = searchParams.get('tag');
    const search = searchParams.get('q');
    
    if (tag) {
      setSelectedTags([tag]);
    }
    if (search) {
      setSearchQuery(search);
    }
    
    fetchQuestions();
    fetchPopularTags();
  }, [searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedTags, sortBy, searchQuery]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll(1, 20, selectedTags, searchQuery);
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
      setPopularTags(response.data.tags.slice(0, 20));
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTags.length > 0) params.set('tag', selectedTags[0]);
    setSearchParams(params);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Questions</h1>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'newest' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('newest')}
              >
                Newest
              </Button>
              <Button
                variant={sortBy === 'votes' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('votes')}
              >
                Most Votes
              </Button>
              <Button
                variant={sortBy === 'answers' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('answers')}
              >
                Most Answers
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search />}
              />
            </form>

            {(selectedTags.length > 0 || searchQuery) && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      className={`${generateTagColor(tag)} cursor-pointer`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                  {searchQuery && (
                    <Badge variant="secondary">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">No questions found matching your criteria.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  showVoting={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Filter by Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : generateTagColor(tag)
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Answered</span>
                <span className="font-medium">
                  {questions.filter(q => q.answers.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unanswered</span>
                <span className="font-medium">
                  {questions.filter(q => q.answers.length === 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}