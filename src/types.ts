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
