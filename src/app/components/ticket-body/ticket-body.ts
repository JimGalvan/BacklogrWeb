import { Component, effect, inject, input, signal } from '@angular/core';
import { Ticket, TicketComment } from '../../models/workspace.model';
import { WorkspaceService } from '../../services/workspace.service';
import { MetaRowComponent } from '../meta-row/meta-row';
import { RichTextComponent } from '../rich-text/rich-text';
import { CommentComponent } from '../comment/comment';

@Component({
  selector: 'app-ticket-body',
  imports: [MetaRowComponent, RichTextComponent, CommentComponent],
  templateUrl: './ticket-body.html',
  styleUrl: './ticket-body.css',
})
export class TicketBodyComponent {
  private workspaceService = inject(WorkspaceService);

  ticketKey = input<string>('');
  workspaceId = input<string>('');
  ticket = signal<Ticket | null>(null);
  status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  comments = signal<TicketComment[]>([]);
  commentsStatus = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  constructor() {
    effect(() => {
      const ticketKey = this.ticketKey();
      const workspaceId = this.workspaceId();

      if (workspaceId && ticketKey) {
        this.status.set('loading');
        this.workspaceService.getTicket(workspaceId, ticketKey).subscribe({
          next: (ticket: Ticket) => {
            this.ticket.set(ticket);
            this.status.set('loaded');
          },
          error: () => {
            this.ticket.set(null);
            this.status.set('error');
          },
        });

        this.commentsStatus.set('loading');
        this.workspaceService.getTicketComments(workspaceId, ticketKey).subscribe({
          next: (comments: TicketComment[]) => {
            this.comments.set([...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            this.commentsStatus.set('loaded');
          },
          error: () => {
            this.comments.set([]);
            this.commentsStatus.set('error');
          },
        });
      } else {
        this.status.set('idle');
        this.commentsStatus.set('idle');
      }
    });
  }
}
