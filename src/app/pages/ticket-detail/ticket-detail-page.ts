import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TopbarComponent } from '../../components/layout/topbar/topbar';
import { TicketBodyComponent } from '../../components/ticket/ticket-body/ticket-body';
import { InsightsPanelComponent } from '../../components/insights/insights-panel/insights-panel';
import { Ticket } from '../../models/workspace.model';

@Component({
  selector: 'app-ticket-detail-page',
  imports: [TopbarComponent, TicketBodyComponent, InsightsPanelComponent],
  templateUrl: './ticket-detail-page.html',
  styleUrl: './ticket-detail-page.css',
})
export class TicketDetailPageComponent {
  private route = inject(ActivatedRoute);

  ticketKey = toSignal(
    this.route.paramMap.pipe(map(params => params.get('ticketKey') ?? params.get('key') ?? 'PAY-4827')),
    { initialValue: 'PAY-4827' }
  );

  workspaceId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('workspaceId') ?? '')),
    { initialValue: '' }
  );

  ticket = signal<Ticket | null>(null);
}
