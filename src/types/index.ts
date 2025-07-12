export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'guest' | 'user' | 'admin';
  reputation: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  author: User;
  votes: number;
  answers: Answer[];
  acceptedAnswer?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  _id: string;
  content: string;
  author: User;
  questionId: string;
  votes: number;
  isAccepted: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  answerId: string;
  createdAt: string;
}

export interface Vote {
  _id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  type: 'upvote' | 'downvote';
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'answer' | 'comment' | 'mention' | 'accepted';
  message: string;
  relatedId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  description?: string;
  count: number;
  color: string;
}