import { Component, computed, input } from '@angular/core';
import { Ticket } from '../../../models/workspace.model';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  ticket = input<Ticket | null>(null);

  readonly providerName = computed(() => {
    const provider = this.ticket()?.provider;
    if (!provider) return '';
    const names: Record<string, string> = {
      GITHUB: 'GitHub',
      JIRA: 'Jira',
      AZURE_DEVOPS: 'Azure DevOps',
    };
    return names[provider]
      ?? provider.toLowerCase().replaceAll('_', ' ').replace(/^./, value => value.toUpperCase());
  });
}
