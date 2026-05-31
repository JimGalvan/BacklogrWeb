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

