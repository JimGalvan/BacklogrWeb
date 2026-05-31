import { Component, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TopbarComponent } from '../../components/layout/topbar/topbar';
import { TicketBodyComponent } from '../../components/ticket/ticket-body/ticket-body';
import { InsightsPanelComponent } from '../../components/insights/insights-panel/insights-panel';
import { ImportModalComponent } from '../../components/modals/import-modal/import-modal';

@Component({
  selector: 'app-ticket-detail-page',
  imports: [TopbarComponent, TicketBodyComponent, InsightsPanelComponent, ImportModalComponent],
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

  showModal = signal(false);

  @ViewChild(InsightsPanelComponent)
  insightsPanel?: InsightsPanelComponent;

  onImported() {
    this.showModal.set(false);
    this.insightsPanel?.reanalyze();
  }
}
