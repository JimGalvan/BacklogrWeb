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

import { AdfDoc } from './adf.model';

export interface TicketPerson {
  name: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface TicketComment {
  id: string;
  author: string;
  avatarInitials: string;
  avatarColor: string;
  createdAt: string;
  body: string;
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
  summary: string;
  priority?: 'P1' | 'P2' | 'P3';
  status?: string;
  assignee?: TicketPerson;
  reporter?: TicketPerson;
  sprint?: string;
  affects?: string;
  labels?: string[];
  description?: AdfDoc | null;
  stackTrace?: TicketStackTrace;
  comments?: TicketComment[];
  provider?: string;
  createdAt: string;
  importedAt: string;
}

export interface ImportTicketRequest {
  url: string;
}
