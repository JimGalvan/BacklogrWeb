import { Component, inject } from '@angular/core';
import { IntegrationService } from '../../services/integration.service';
import { INTEGRATION_PROVIDERS } from '../../models/integration.model';
import { ProviderCardComponent } from './provider-card/provider-card';

@Component({
  selector: 'app-integrations-page',
  imports: [ProviderCardComponent],
  templateUrl: './integrations-page.html',
  styleUrl: './integrations-page.css',
})
export class IntegrationsPageComponent {
  private integrationService = inject(IntegrationService);

  readonly providers = INTEGRATION_PROVIDERS;

  isConnected(id: string): boolean {
    return this.integrationService.isConnected(id);
  }

  connect(id: string): void {
    this.integrationService.connect(id).subscribe();
  }
}
