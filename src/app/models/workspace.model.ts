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

export interface WorkspaceTicket {
  id: string;
  ticketKey: string;
  workspaceId: string;
  importedBy: string;
  projectKey: string;
  summary: string;
  createdAt: string;
  importedAt: string;
}

export interface ImportTicketRequest {
  url: string;
}
