import { RichTextDoc } from './rich-text.model';
import { TicketMedia } from './ticket-media.model';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  lastModifiedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string | null;
  joinedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  ownerId: string;
}

export interface InviteRequest {
  email: string;
}

export interface TicketPerson {
  name: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface TicketComment {
  id: string;
  authorEmail: string;
  authorName: string;
  body: RichTextDoc;
  media: TicketMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketStackTrace {
  label: string;
  html: string;
}

export interface Ticket {
  id: string;
  ticketKey: string;
  workspaceId: string;
  importedBy: string;
  projectKey: string;
  title: string;
  externalUrl: string | null;
  priority?: 'P1' | 'P2' | 'P3';
  status?: string;
  assignee?: TicketPerson;
  reporter?: TicketPerson;
  sprint?: string;
  affects?: string;
  labels?: string[];
  description?: RichTextDoc | null;
  media: TicketMedia[];
  stackTrace?: TicketStackTrace;
  comments?: TicketComment[];
  provider?: string;
  createdAt: string;
  importedAt: string;
}

export interface ImportTicketRequest {
  url: string;
}
