import { Component, effect, inject, input, signal } from '@angular/core';
import { MockTicket } from '../../models/ticket.model';
import { RichTextDoc } from '../../models/rich-text.model';
import { Ticket } from '../../models/workspace.model';
import { TicketService } from '../../services/ticket.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PriorityChipComponent } from '../priority-chip/priority-chip';
import { MetaRowComponent } from '../meta-row/meta-row';
import { StackTraceComponent } from '../stack-trace/stack-trace';
import { CommentComponent } from '../comment/comment';
import { RichTextComponent } from '../rich-text/rich-text';

@Component({
  selector: 'app-ticket-body',
  imports: [PriorityChipComponent, MetaRowComponent, StackTraceComponent, CommentComponent, RichTextComponent],
  templateUrl: './ticket-body.html',
  styleUrl: './ticket-body.css',
})
export class TicketBodyComponent {
  private ticketService = inject(TicketService);
  private workspaceService = inject(WorkspaceService);

  ticketKey = input<string>('PAY-4827');
  workspaceId = input<string>('');
  ticket = signal<MockTicket | null>(null);

  constructor() {
    effect(() => {
      const key = this.ticketKey();
      const workspaceId = this.workspaceId();

      if (workspaceId) {
        this.workspaceService.getTicket(workspaceId, key).subscribe({
          next: (real: Ticket) => {
            this.ticketService.getTicket(key).subscribe(mock => {
              const description: RichTextDoc = real.description
                ? { format: 'adf', content: real.description }
                : mock.description;
              this.ticket.set({
                ...mock,
                key: real.ticketKey,
                project: real.projectKey,
                title: real.summary,
                description,
              });
            });
          },
          error: () => {
            this.ticketService.getTicket(key).subscribe(mock => this.ticket.set(mock));
          },
        });
      } else {
        this.ticketService.getTicket(key).subscribe(mock => this.ticket.set(mock));
      }
    });
  }
}
