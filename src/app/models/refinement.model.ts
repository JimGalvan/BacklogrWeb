export type RefinementGrounding = 'TICKET' | 'TICKET_AND_CODE';

export type RefinementCategory =
  | 'MISSING_ACCEPTANCE_CRITERION'
  | 'AMBIGUOUS_BEHAVIOR'
  | 'CONTRADICTION'
  | 'MISSING_EDGE_CASE'
  | 'DATA_OR_MIGRATION_BEHAVIOR'
  | 'API_OR_COMPATIBILITY_RISK'
  | 'SCOPE_OR_DEPENDENCY_GAP'
  | 'TESTABILITY_GAP';

export type RefinementEvidenceType =
  | 'TICKET_DESCRIPTION'
  | 'COMMENT'
  | 'IMAGE'
  | 'SOURCE_FILE'
  | 'SOURCE_PROFILE';

export type RecommendedChangeType = 'CLARIFYING_QUESTION' | 'ACCEPTANCE_CRITERION';

export interface RefinementEvidence {
  type: RefinementEvidenceType;
  label: string;
  excerpt: string;
  commentId: string | null;
  imageNumber: number | null;
  imageUrl: string | null;
  sourceId: string | null;
  sourceName: string | null;
  path: string | null;
}

export interface RefinementFinding {
  id: string;
  category: RefinementCategory;
  title: string;
  problem: string;
  evidence: RefinementEvidence[];
  decisionNeeded: string;
  recommendedChange: {
    type: RecommendedChangeType;
    text: string;
  };
  verificationRule: string;
}

export interface RefinementFindingsResponse {
  summary: string;
  grounding: RefinementGrounding;
  findings: RefinementFinding[];
}
