export interface Player {
  id: string;
  name: string;
  position: string;
  avatar_url?: string;
}

export interface PlayerMatchStat {
  playerId: string;
  goals: number;
  assists: number;
  saves: number;
  skp: number;
  attended: boolean;
}

export interface MatchRecord {
  id: string;
  date: string;
  description: string;
  opponent?: string;
  opponent_logo?: string;
  home_score?: number;
  away_score?: number;
  stats: PlayerMatchStat[];
}

export interface AppUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  last_login?: string;
  total_time?: number;
  created_at: string;
}
