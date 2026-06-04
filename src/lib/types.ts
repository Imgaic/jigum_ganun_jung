export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  points: number;
  reportCount: number;
  trustScore: number;
  rank: number;
  score: number;
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  points: number;
  reportCount: number;
  trustScore: number;
  score: number;
  isCurrentUser: boolean;
}

export interface SessionPayload {
  userId: number;
  username: string;
}
