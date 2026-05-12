import { Component, inject, OnInit, signal } from '@angular/core';
import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { PriorityChipComponent } from '../priority-chip/priority-chip';
import { MetaRowComponent } from '../meta-row/meta-row';
import { StackTraceComponent } from '../stack-trace/stack-trace';
import { CommentComponent } from '../comment/comment';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-ticket-body',
  imports: [PriorityChipComponent, MetaRowComponent, StackTraceComponent, CommentComponent, SafeHtmlPipe],
  templateUrl: './ticket-body.html',
  styleUrl: './ticket-body.css',
})
export class TicketBodyComponent implements OnInit {
  private ticketService = inject(TicketService);
  ticket = signal<Ticket | null>(null);

  ngOnInit() {
    this.ticketService.getTicket('PAY-4827').subscribe(t => this.ticket.set(t));
  }
}
