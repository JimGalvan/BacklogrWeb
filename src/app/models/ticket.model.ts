export type AvatarVariant = 'a' | 'b' | 'c';

export interface PersonAvatar {
  initials: string;
  variant: AvatarVariant;
}

export interface TicketComment {
  id: string;
  author: string;
  avatar: PersonAvatar;
  timeAgo: string;
  bodyHtml: string;
}

export interface Ticket {
  key: string;
  project: string;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  status: string;
  assignee: { name: string; avatar: PersonAvatar };
  reporter: { name: string; avatar: PersonAvatar };
  sprint: string;
  affects: string;
  labels: string[];
  descriptionHtml: string;
  stackTraceLabel: string;
  stackTraceHtml: string;
  comments: TicketComment[];
}

export interface WorkspaceTicketSummary {
  key: string;
  title: string;
  project: string;
}

export interface TicketListItem {
  key: string;
  project: string;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  status: string;
  assignee: { name: string; avatar: PersonAvatar };
  importedAt: string;
}
