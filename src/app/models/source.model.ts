export type SourceStatus = 'CONNECTED' | 'PROFILING' | 'PROFILED' | 'FAILED';

const STATUS_LABELS: Record<SourceStatus, string> = {
  CONNECTED: 'Connected',
  PROFILING: 'Indexing',
  PROFILED: 'Ready',
  FAILED: 'Failed',
};

/** User-facing label for a source status. */
export function sourceStatusLabel(status: SourceStatus): string {
  return STATUS_LABELS[status];
}

/** User-facing label for a source type, e.g. REPOSITORY → "Code repository". */
export function sourceTypeLabel(sourceType: string): string {
  if (sourceType === 'REPOSITORY') return 'Code repository';
  const label = sourceType.toLowerCase().replaceAll('_', ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Abbreviated indexed revision (first 8 characters), or null when not indexed. */
export function shortRevision(source: Source): string | null {
  return source.indexedRevision ? source.indexedRevision.slice(0, 8) : null;
}

/** True while any source in the list is still being indexed. */
export function hasIndexingSources(sources: Source[]): boolean {
  return sources.some(source => source.status === 'PROFILING');
}

/**
 * Mirrors IndexFailure in backlogr-API (CodeIntelligenceContracts) and Code-themed
 * (domain/dto/intelligence/contracts.py) — change all three together.
 */
export interface SourceIndexFailure {
  code: string;
  stage: string;
  message: string;
  canRetry: boolean;
}

export interface Source {
  id: string;
  workspaceId: string;
  provider: string;
  sourceType: string;
  name: string;
  organization: string | null;
  projectReference: string | null;
  defaultBranch: string | null;
  remoteUrl: string | null;
  webUrl: string | null;
  status: SourceStatus;
  indexJobId: string | null;
  indexedRevision: string | null;
  failure: SourceIndexFailure | null;
  addedAt: string;
}
