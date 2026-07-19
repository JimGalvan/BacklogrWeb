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
  readonly refinementTab = viewChild(RefinementTabComponent);
  readonly testCasesTab = viewChild(TestCasesTabComponent);

  reanalyze(): void {
    switch (this.activeTab()) {
      case 'summary':    this.summaryTab()?.reanalyze(); break;
      case 'refinement': this.refinementTab()?.run(); break;
      case 'tests':      this.testCasesTab()?.run(); break;
    }
  }
}
