import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { Answer } from '../types';
import { Button } from './ui/Button';
import { VoteButtons } from './VoteButtons';
import { formatRelativeTime } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface AnswerCardProps {
  answer: Answer;
  questionAuthorId: string;
  onVote?: (type: 'upvote' | 'downvote') => void;
  onAccept?: () => void;
  userVote?: 'upvote' | 'downvote' | null;
}

export function AnswerCard({ 
  answer, 
  questionAuthorId, 
  onVote, 
  onAccept, 
  userVote 
}: AnswerCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const canAccept = user?._id === questionAuthorId && !answer.isAccepted;

  return (
    <div className={`bg-white rounded-lg border p-6 ${answer.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {onVote && (
            <VoteButtons
              votes={answer.votes}
              userVote={userVote}
              onVote={onVote}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {answer.isAccepted && (
            <div className="flex items-center space-x-2 mb-4 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Accepted Answer</span>
            </div>
          )}

          <div
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {canAccept && onAccept && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAccept}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept Answer
                </Button>
              )}

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{answer.comments.length} comments</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatRelativeTime(answer.createdAt)}</span>
              </div>
              <span>by</span>
              <Link
                to={`/users/${answer.author._id}`}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {answer.author.username}
              </Link>
            </div>
          </div>

          {showComments && answer.comments.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              {answer.comments.map((comment) => (
                <div key={comment._id} className="text-sm">
                  <div
                    className="text-gray-700 mb-1"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />
                  <div className="text-xs text-gray-500">
                    <Link
                      to={`/users/${comment.author._id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {comment.author.username}
                    </Link>
                    <span className="mx-1">•</span>
                    <span>{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}