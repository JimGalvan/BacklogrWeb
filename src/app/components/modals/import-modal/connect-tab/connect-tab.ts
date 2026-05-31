import { Component, inject } from '@angular/core';
import { IntegrationService } from '../../../../services/integration.service';
import { INTEGRATION_PROVIDERS, IntegrationProvider } from '../../../../models/integration.model';
import { IntegrationCardComponent } from '../integration-card/integration-card';

@Component({
  selector: 'app-import-connect-tab',
  imports: [IntegrationCardComponent],
  templateUrl: './connect-tab.html',
  styleUrl: './connect-tab.css',
})
export class ImportConnectTabComponent {
  private integrationService = inject(IntegrationService);

  readonly providers: IntegrationProvider[] = INTEGRATION_PROVIDERS.filter(provider => !provider.comingSoon);

  isConnected(id: string): boolean {
    return this.integrationService.isConnected(id);
  }

  connect(id: string): void {
    this.integrationService.connect(id);
  }
}
