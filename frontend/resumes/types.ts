export interface Resume {
  id: number;
  name: string;
  industry: string;
  level: string;
  elo: number;
  battles: number;
  wins: number;
  winRate: number;
  lastBattle: string;
  status: "active" | "paused" | "inactive";
  feedback: number;
  uploadDate: string;
}
