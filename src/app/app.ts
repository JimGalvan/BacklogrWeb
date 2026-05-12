import { Component, signal, ViewChild } from '@angular/core';
import { LeftRailComponent } from './components/left-rail/left-rail';
import { TopbarComponent } from './components/topbar/topbar';
import { TicketBodyComponent } from './components/ticket-body/ticket-body';
import { InsightsPanelComponent } from './components/insights-panel/insights-panel';
import { ImportModalComponent } from './components/import-modal/import-modal';

@Component({
  selector: 'app-root',
  imports: [
    LeftRailComponent,
    TopbarComponent,
    TicketBodyComponent,
    InsightsPanelComponent,
    ImportModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  showModal = signal(false);

  @ViewChild(InsightsPanelComponent)
  insightsPanel?: InsightsPanelComponent;

  onImported() {
    this.showModal.set(false);
    this.insightsPanel?.startStream();
  }
}
