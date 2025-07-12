import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, Clock, CheckCircle } from 'lucide-react';
import { Question } from '../types';
import { Badge } from './ui/Badge';
import { VoteButtons } from './VoteButtons';
import { formatRelativeTime, generateTagColor } from '../lib/utils';

interface QuestionCardProps {
  question: Question;
  onVote?: (type: 'upvote' | 'downvote') => void;
  userVote?: 'upvote' | 'downvote' | null;
  showVoting?: boolean;
}

export function QuestionCard({ 
  question, 
  onVote, 
  userVote, 
  showVoting = true 
}: QuestionCardProps) {
  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover glow-effect group cursor-pointer fade-in">
      <div className="flex gap-4">
        {showVoting && onVote && (
          <div className="flex-shrink-0">
            <VoteButtons
              votes={question.votes}
              userVote={userVote}
              onVote={onVote}
              size="sm"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <Link
              to={`/questions/${question._id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 line-clamp-2 group-hover:scale-[1.02]"
            >
              {question.title}
            </Link>
            {hasAcceptedAnswer && (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2 animate-pulse" />
            )}
          </div>

          <div
            className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag) => (
              <Badge
                key={tag}
                className={generateTagColor(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4 group-hover:text-blue-500 transition-colors duration-300" />
                <span>{question.answers.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4 group-hover:text-green-500 transition-colors duration-300" />
                <span>{question.views}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 group-hover:text-purple-500 transition-colors duration-300" />
                <span>{formatRelativeTime(question.createdAt)}</span>
              </div>
              <span>by</span>
              <Link
                to={`/users/${question.author._id}`}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 hover:underline"
              >
                {question.author.username}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}