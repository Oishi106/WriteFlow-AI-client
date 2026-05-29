export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'TEAM';
  status: 'ACTIVE' | 'BANNED';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  _id: string;
  title: string;
  description: string;
  image?: string;
  category: 'blog' | 'social' | 'email' | 'ad-copy';
  rating: number;
  usageCount: number;
  tone?: string;
  estimatedWordCount?: number;
  aiModel?: string;
  prompt?: string;
  sampleOutput?: string;
  createdBy: { _id: string; name: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  approved: boolean;
  userId: { _id: string; name: string; email?: string; avatar?: string };
  itemId: { _id: string; title: string; category: string };
  createdAt: string;
}

export interface Booking {
  _id: string;
  userId: { _id: string; name: string; email: string };
  itemId: { _id: string; title: string; category: string; image?: string };
  quantity: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface AILog {
  _id: string;
  userId: string;
  agentUsed: 'Content Draft' | 'Rewrite & Tone' | 'Chat Assistant' | 'Review Summariser';
  promptSnippet: string;
  tokensUsed: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
