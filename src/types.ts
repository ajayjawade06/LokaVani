export type Language = 'en' | 'hi' | 'mr';

export interface News {
  id: number;
  base_language: Language;
  title_en: string;
  title_hi: string;
  title_mr: string;
  content_en: string;
  content_hi: string;
  content_mr: string;
  coverage: 'local' | 'national' | 'international';
  category: string;
  image_url: string | null;
  published: number;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
