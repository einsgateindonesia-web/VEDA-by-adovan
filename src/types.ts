export interface ArticleItem {
  id: string;
  hashId: string;
  title: string;
  summary: string;
  link: string;
  sourceId: string;
  sourceName: string;
  category: string;
  language: string;
  publishedAt: string;
  fetchedAt: string;
}

export interface SourceItem {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string;
  active: boolean;
  description?: string;
  lastFetchedAt?: string;
  lastStatus?: 'ONLINE' | 'ERROR' | 'PENDING';
  lastError?: string;
  latencyMs?: number;
  articleCount?: number;
}

export interface FetchLog {
  id: string;
  timestamp: string;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  newArticles: number;
  durationMs: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  details?: string;
}

export interface SystemStats {
  totalArticles: number;
  totalSources: number;
  activeSources: number;
  onlineSources: number;
  healthRate: number;
  lastSyncAt: string | null;
  isSyncing: boolean;
  nextSyncMinutes: number;
  categoryCounts: Record<string, number>;
  recentLog?: FetchLog | null;
}

export type ViewTab = 'feed' | 'sources' | 'logs' | 'architecture';
export type DisplayMode = 'grid' | 'stream';
