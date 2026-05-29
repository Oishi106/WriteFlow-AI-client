import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = (now.getTime() - then.getTime()) / 1000;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const CONTENT_CATEGORIES = [
  { value: 'blog', label: 'Blog Post', color: 'brand' },
  { value: 'social', label: 'Social Media', color: 'purple' },
  { value: 'email', label: 'Email', color: 'green' },
  { value: 'ad-copy', label: 'Ad Copy', color: 'orange' },
] as const;

export const TONE_OPTIONS = [
  'professional',
  'casual',
  'formal',
  'friendly',
  'persuasive',
  'humorous',
  'inspirational',
] as const;

export const PLAN_LIMITS = {
  FREE: { documents: 5, words: 10000, agents: 1 },
  PRO: { documents: 100, words: 500000, agents: 3 },
  TEAM: { documents: -1, words: -1, agents: 4 },
};
