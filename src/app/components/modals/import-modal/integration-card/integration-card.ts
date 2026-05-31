import { Component, input, output } from '@angular/core';
import { IntegrationProvider } from '../../../../models/integration.model';
import { IconComponent } from '../../../ui/common/icon/icon';

@Component({
  selector: 'app-integration-card',
  imports: [IconComponent],
  templateUrl: './integration-card.html',
  styleUrl: './integration-card.css',
})
export class IntegrationCardComponent {
  provider = input.required<IntegrationProvider>();
  connected = input(false);
  connect = output<void>();
}
