import { Component, input, output } from '@angular/core';
import { IntegrationProvider } from '../../../models/integration.model';
import { IconComponent } from '../../../components/ui/common/icon/icon';

@Component({
  selector: 'app-provider-card',
  imports: [IconComponent],
  templateUrl: './provider-card.html',
  styleUrl: './provider-card.css',
})
export class ProviderCardComponent {
  provider = input.required<IntegrationProvider>();
  connected = input(false);
  connect = output<void>();
}
