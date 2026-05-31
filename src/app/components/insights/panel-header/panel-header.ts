import { Component, input, output } from '@angular/core';
import { ToolTabsComponent } from '../tool-tabs/tool-tabs';
import { IconComponent } from '../../ui/common/icon/icon';

@Component({
  selector: 'app-panel-header',
  imports: [ToolTabsComponent, IconComponent],
  templateUrl: './panel-header.html',
  styleUrl: './panel-header.css',
})
export class PanelHeaderComponent {
  activeTab = input.required<string>();
  tabChange = output<string>();
}
