export type RelevantFilesGrounding = 'TICKET' | 'TICKET_AND_CODE';

export interface RelevantFileMatch {
  startLine: number | null;
  endLine: number | null;
  excerpt: string;
}

export interface RelevantFile {
  sourceId: string;
  sourceName: string;
  revision: string | null;
  path: string;
  matches: RelevantFileMatch[];
}

export interface RelevantFilesResponse {
  grounding: RelevantFilesGrounding;
  indexing: boolean;
  files: RelevantFile[];
  warnings: string[];
}
