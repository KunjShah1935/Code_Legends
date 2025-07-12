import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface VoteButtonsProps {
  votes: number;
  userVote?: 'upvote' | 'downvote' | null;
  onVote: (type: 'upvote' | 'downvote') => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function VoteButtons({ 
  votes, 
  userVote, 
  onVote, 
  disabled = false,
  size = 'md' 
}: VoteButtonsProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'p-1' : 'p-2';

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote('upvote')}
        disabled={disabled}
        className={cn(
          buttonSize,
          'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-300 hover:scale-125 hover:shadow-glow-sm',
          userVote === 'upvote' && 'bg-green-100 dark:bg-green-900/30 text-green-600 shadow-glow-sm animate-pulse'
        )}
      >
        <ChevronUp className={iconSize} />
      </Button>
      
      <span className={cn(
        'font-semibold',
        size === 'sm' ? 'text-sm' : 'text-base',
        votes > 0 ? 'text-green-600' : votes < 0 ? 'text-red-600' : 'text-gray-600'
      )}>
        {votes}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote('downvote')}
        disabled={disabled}
        className={cn(
          buttonSize,
          'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 hover:scale-125 hover:shadow-glow-sm',
          userVote === 'downvote' && 'bg-red-100 dark:bg-red-900/30 text-red-600 shadow-glow-sm animate-pulse'
        )}
      >
        <ChevronDown className={iconSize} />
      </Button>
    </div>
  );
}