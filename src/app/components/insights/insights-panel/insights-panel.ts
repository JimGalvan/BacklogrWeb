import { Component, input, signal, viewChild } from '@angular/core';
import { PanelHeaderComponent } from '../panel-header/panel-header';
import { PanelFooterComponent } from '../panel-footer/panel-footer';
import { SummaryTabComponent } from '../summary-tab/summary-tab';
import { RefinementTabComponent } from '../refinement-tab/refinement-tab';
import { TestCasesTabComponent } from '../test-cases-tab/test-cases-tab';

@Component({
  selector: 'app-insights-panel',
  imports: [
    PanelHeaderComponent,
    PanelFooterComponent,
    SummaryTabComponent,
    RefinementTabComponent,
    TestCasesTabComponent,
  ],
  templateUrl: './insights-panel.html',
  styleUrl: './insights-panel.css',
})
export class InsightsPanelComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  activeTab = signal('summary');

  readonly summaryTab = viewChild(SummaryTabComponent);

  /** Re-runs the TL;DR summary analysis (e.g. after a fresh import). */
  reanalyze(): void {
    this.summaryTab()?.reanalyze();
  }
}
