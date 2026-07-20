export type TicketMediaType = 'IMAGE';
export type TicketMediaOrigin = 'DESCRIPTION' | 'COMMENT';

export interface TicketMedia {
  id: string;
  type: TicketMediaType;
  url: string;
  mimeType: string | null;
  altText: string | null;
  origin: TicketMediaOrigin;
  commentId: string | null;
  authorName: string | null;
  authorEmail: string | null;
}
