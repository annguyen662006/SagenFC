export interface Player {
  id: string;
  name: string;
  position: string;
}

export interface PlayerMatchStat {
  playerId: string;
  goals: number;
  assists: number;
  saves: number;
  attended: boolean;
}

export interface MatchRecord {
  id: string;
  date: string;
  description: string;
  stats: PlayerMatchStat[];
}
