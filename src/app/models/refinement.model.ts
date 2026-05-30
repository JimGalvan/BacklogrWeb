export interface RefinementItem {
  title: string;
  description: string;
}

export interface RefinementAnalysis {
  summary: string;
  openQuestions: RefinementItem[];
  scopeClarifications: RefinementItem[];
  risksAndEdgeCases: RefinementItem[];
  acceptanceCriteriaGaps: RefinementItem[];
}

export interface RefinementAnalysisResponse {
  refinementAnalysis: RefinementAnalysis;
}
