import { Component, input, output } from '@angular/core';
import { IconComponent } from '../../ui/common/icon/icon';

@Component({
  selector: 'app-panel-footer',
  imports: [IconComponent],
  templateUrl: './panel-footer.html',
  styleUrl: './panel-footer.css',
})
export class PanelFooterComponent {
  contextTokens = input<string | undefined>(undefined);
  reanalyze = output<void>();
}
