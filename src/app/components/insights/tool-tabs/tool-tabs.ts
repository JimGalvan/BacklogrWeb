import { Component, input, output } from '@angular/core';

export interface ToolTab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tool-tabs',
  imports: [],
  templateUrl: './tool-tabs.html',
  styleUrl: './tool-tabs.css',
})
export class ToolTabsComponent {
  activeTab = input<string>('summary');
  tabChange = output<string>();

  tabs: ToolTab[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'refinement', label: 'Refinement Findings' },
    { id: 'files', label: 'Relevant Files' },
  ];

  selectTab(tab: ToolTab) {
    this.tabChange.emit(tab.id);
  }
}
