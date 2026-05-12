export interface InsightsBullet {
  html: string;
}

export interface Insights {
  ticketKey: string;
  tldr: string;
  bullets: InsightsBullet[];
  model: string;
  latency: string;
  contextTokens: string;
}
