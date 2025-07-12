import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Clock, MessageCircle } from 'lucide-react';
import { Question, Answer } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { VoteButtons } from '../components/VoteButtons';
import { AnswerCard } from '../components/AnswerCard';
import { RichTextEditor } from '../components/RichTextEditor';
import { questionsAPI, answersAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime, generateTagColor } from '../lib/utils';
import toast from 'react-hot-toast';

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getById(id!);
      setQuestion(response.data.question);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      toast.error('Question not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionVote = async (type: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await questionsAPI.vote(id!, type);
      fetchQuestion(); // Refresh to get updated vote count
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  };

  const handleAnswerVote = async (answerId: string, type: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await answersAPI.vote(answerId, type);
      fetchQuestion(); // Refresh to get updated vote count
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await answersAPI.accept(answerId);
      fetchQuestion(); // Refresh to show accepted answer
      toast.success('Answer accepted!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept answer');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user) {
      toast.error('Please sign in to answer');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      await answersAPI.create(id!, answerContent);
      setAnswerContent('');
      fetchQuestion(); // Refresh to show new answer
      toast.success('Answer posted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return b.votes - a.votes;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <VoteButtons
              votes={question.votes}
              onVote={handleQuestionVote}
              disabled={!user}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Asked {formatRelativeTime(question.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answers.length} answers</span>
              </div>
            </div>

            <div
              className="prose prose-sm max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <Badge
                  key={tag}
                  className={generateTagColor(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Asked by{' '}
                <span className="font-medium text-blue-600">
                  {question.author.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {sortedAnswers.map((answer) => (
          <AnswerCard
            key={answer._id}
            answer={answer}
            questionAuthorId={question.author._id}
            onVote={(type) => handleAnswerVote(answer._id, type)}
            onAccept={() => handleAcceptAnswer(answer._id)}
          />
        ))}

        {/* Answer Form */}
        {user ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <RichTextEditor
              content={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
              className="mb-4"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitAnswer}
                loading={submittingAnswer}
                disabled={!answerContent.trim()}
              >
                Post Answer
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-4">Sign in to post an answer</p>
            <Button onClick={() => navigate('/')}>Sign In</Button>
          </div>
        )}
      </div>
    </div>
  );
}