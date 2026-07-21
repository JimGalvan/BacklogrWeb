export type RelevantFilesGrounding = 'TICKET' | 'TICKET_AND_CODE';

export interface RelevantFileMatch {
  startLine: number | null;
  endLine: number | null;
  excerpt: string;
  webUrl: string | null;
}

export interface RelevantFile {
  sourceId: string;
  sourceName: string;
  revision: string | null;
  path: string;
  webUrl: string | null;
  matches: RelevantFileMatch[];
}

export interface RelevantFilesResponse {
  grounding: RelevantFilesGrounding;
  indexing: boolean;
  files: RelevantFile[];
  warnings: string[];
}
