import { Component, effect, inject, input, signal } from '@angular/core';
import { Ticket } from '../../../models/workspace.model';
import { WorkspaceService } from '../../../services/workspace.service';
import { MetaRowComponent } from '../meta-row/meta-row';
import { RichTextComponent } from '../../ui/common/rich-text/rich-text';
import { CommentsSectionComponent } from '../../comments/comments-section/comments-section';
import { TicketBodySkeletonComponent } from '../ticket-body-skeleton/ticket-body-skeleton';
import { EmptyStateComponent } from '../../ui/common/empty-state/empty-state';

@Component({
  selector: 'app-ticket-body',
  imports: [
    MetaRowComponent,
    RichTextComponent,
    CommentsSectionComponent,
    TicketBodySkeletonComponent,
    EmptyStateComponent,
  ],
  templateUrl: './ticket-body.html',
  styleUrl: './ticket-body.css',
})
export class TicketBodyComponent {
  private workspaceService = inject(WorkspaceService);

  ticketKey = input<string>('');
  workspaceId = input<string>('');
  ticket = signal<Ticket | null>(null);
  status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');

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
      } else {
        this.status.set('idle');
      }
    });
  }
}
