import { Component, input, signal, viewChild } from '@angular/core';
import { PanelHeaderComponent } from '../panel-header/panel-header';
import { PanelFooterComponent } from '../panel-footer/panel-footer';
import { SummaryTabComponent } from '../summary-tab/summary-tab';
import { RefinementTabComponent } from '../refinement-tab/refinement-tab';
import { RelevantFilesTabComponent } from '../relevant-files-tab/relevant-files-tab';
import { SourceContextBarComponent } from '../source-context-bar/source-context-bar';

@Component({
  selector: 'app-insights-panel',
  imports: [
    PanelHeaderComponent,
    PanelFooterComponent,
    SummaryTabComponent,
    RefinementTabComponent,
    RelevantFilesTabComponent,
    SourceContextBarComponent,
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
  readonly relevantFilesTab = viewChild(RelevantFilesTabComponent);

  selectTab(tab: string): void {
    this.activeTab.set(tab);
    if (tab === 'files') this.relevantFilesTab()?.load();
  }

  reanalyze(): void {
    switch (this.activeTab()) {
      case 'summary':    this.summaryTab()?.reanalyze(); break;
      case 'refinement': this.refinementTab()?.run(); break;
      case 'files':      this.relevantFilesTab()?.refresh(); break;
    }
  }

  footerActionLabel(): string {
    return this.activeTab() === 'files' ? 'Refresh relevance' : 'Re-analyze';
  }
}
