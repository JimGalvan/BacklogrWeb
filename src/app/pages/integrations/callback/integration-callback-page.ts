import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CONNECTION_RESULT_MESSAGE_TYPE, ConnectionResult, INTEGRATION_PROVIDERS } from '../../../models/integration.model';
import { IntegrationService } from '../../../services/integration.service';

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
  readonly provider = this.route.snapshot.queryParamMap.get('provider')?.toLowerCase() ?? '';
  readonly status = this.route.snapshot.queryParamMap.get('status') === 'connected'
    ? 'connected'
    : 'error';
  readonly message = this.route.snapshot.queryParamMap.get('message')
    || 'GitHub did not complete the connection.';
  readonly returnPath = this.safeReturnPath(
    this.route.snapshot.queryParamMap.get('returnPath')
  );
  readonly providerName =
    INTEGRATION_PROVIDERS.find(provider => provider.id === this.provider)?.name ?? 'Connection';

  ngOnInit(): void {
    const result: ConnectionResult = {
      type: CONNECTION_RESULT_MESSAGE_TYPE,
      provider: this.provider,
      status: this.status,
      message: this.status === 'connected' ? undefined : this.message,
      returnPath: this.returnPath,
    };

    if (this.status === 'connected') {
      this.integrationService.markConnected(this.provider);
    }

    if (window.opener) {
      window.opener.postMessage(result, window.location.origin);
      window.setTimeout(() => window.close(), 650);
    }
  }

  private safeReturnPath(value: string | null): string {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return '/onboarding';
    return value;
  }
}
