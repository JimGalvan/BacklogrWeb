import { Component, input, output, signal } from '@angular/core';

export interface ToolTab {
  id: string;
  label: string;
  disabled?: boolean;
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
    { id: 'tests', label: 'Test cases', disabled: true },
    { id: 'hypotheses', label: 'Hypotheses', disabled: true },
    { id: 'risk', label: 'Risk', disabled: true },
    { id: 'similar', label: 'Similar', disabled: true },
  ];

  selectTab(tab: ToolTab) {
    if (!tab.disabled) {
      this.tabChange.emit(tab.id);
    }
  }
}
