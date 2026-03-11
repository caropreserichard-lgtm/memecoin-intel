export interface Source {
  id: string;
  name: string;
  url: string;
  rss_url: string | null;
  category: 'animals' | 'weird' | 'science' | 'tech' | 'environment';
  trust_level: number;
  active: boolean;
  use_scraping: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source_id: string;
  category: string | null;
  published_at: string | null;
  body_text: string | null;
  memecoin_score: number | null;
  virality_score: number | null;
  visual_score: number | null;
  lore_score: number | null;
  shillability_score: number | null;
  simplicity_score: number | null;
  controversy_score: number | null;
  verdict: string | null;
  suggested_tickers: string[] | null;
  suggested_names: string[] | null;
  suggested_pitch: string | null;
  ct_shill_angle: string | null;
  key_entities: string[] | null;
  emotional_profile: string[] | null;
  mascot_potential: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  concise_summary: string | null;
  why_interesting: string | null;
  is_starred: boolean;
  is_rejected: boolean;
  created_at: string;
  sources?: Source;
}

export interface Cluster {
  id: string;
  primary_article_id: string;
  related_article_ids: string[];
  created_at: string;
}

export interface ClaudeAnalysis {
  memecoin_score: number;
  virality_score: number;
  visual_score: number;
  lore_score: number;
  shillability_score: number;
  simplicity_score: number;
  controversy_score: number;
  concise_summary: string;
  why_interesting: string;
  key_entities: string[];
  emotional_profile: string[];
  mascot_potential: string | null;
  suggested_tickers: string[];
  suggested_names: string[];
  suggested_pitch: string;
  ct_shill_angle: string;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
}

export interface ScanResult {
  scanned: number;
  new: number;
  errors: number;
}

// Supabase Database type for type-safe queries
export interface Database {
  public: {
    Tables: {
      sources: {
        Row: Source;
        Insert: Omit<Source, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Source, 'id'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'is_starred' | 'is_rejected'> & {
          id?: string;
          created_at?: string;
          is_starred?: boolean;
          is_rejected?: boolean;
        };
        Update: Partial<Omit<Article, 'id'>>;
      };
      clusters: {
        Row: Cluster;
        Insert: Omit<Cluster, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Cluster, 'id'>>;
      };
    };
  };
}
