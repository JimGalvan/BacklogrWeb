import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { IntegrationService } from '../../../services/integration.service';
import { INTEGRATION_PROVIDERS } from '../../../models/integration.model';

@Component({
  selector: 'app-integration-callback-page',
  imports: [RouterLink],
  templateUrl: './integration-callback-page.html',
  styleUrl: './integration-callback-page.css',
})
export class IntegrationCallbackPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private integrationService = inject(IntegrationService);

  readonly isPopup = !!window.opener;
  readonly provider = this.route.snapshot.queryParamMap.get('provider') ?? '';
  readonly providerName =
    INTEGRATION_PROVIDERS.find(p => p.id === this.provider)?.name ?? 'Your workspace';

  ngOnInit() {
    if (this.provider) {
      this.integrationService.markConnected(this.provider);
    }
    if (this.isPopup) {
      setTimeout(() => window.close(), 300);
    }
  }
}
