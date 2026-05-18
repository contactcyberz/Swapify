export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  city: string;
  country: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  timeBalance: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  isVerified: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: 'beginner' | 'intermediate' | 'expert';
  description?: string;
}

export type SkillCategory =
  | 'tech'
  | 'language'
  | 'music'
  | 'cooking'
  | 'sports'
  | 'business'
  | 'art'
  | 'health'
  | 'education'
  | 'home'
  | 'other';

export interface Exchange {
  id: string;
  requesterId: string;
  providerId: string;
  skillOffered: Skill;
  skillWanted: Skill;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  durationHours: number;
  message?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  exchangeId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedId: string;
  exchangeId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const SKILL_CATEGORIES: { id: SkillCategory; label: string; emoji: string }[] = [
  { id: 'tech', label: 'Tech & Code', emoji: '💻' },
  { id: 'language', label: 'Langues', emoji: '🌍' },
  { id: 'music', label: 'Musique', emoji: '🎵' },
  { id: 'cooking', label: 'Cuisine', emoji: '🍳' },
  { id: 'sports', label: 'Sport & Fitness', emoji: '💪' },
  { id: 'business', label: 'Business', emoji: '📈' },
  { id: 'art', label: 'Art & Design', emoji: '🎨' },
  { id: 'health', label: 'Santé & Bien-être', emoji: '🧘' },
  { id: 'education', label: 'Éducation', emoji: '📚' },
  { id: 'home', label: 'Maison & Bricolage', emoji: '🔨' },
  { id: 'other', label: 'Autre', emoji: '✨' },
];
