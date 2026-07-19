import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { OnboardingState } from '../../models/onboarding.model';
import { IntegrationService } from '../../services/integration.service';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-page',
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.css',
})
export class OnboardingPageComponent implements OnInit {
  private onboardingService = inject(OnboardingService);
  private integrationService = inject(IntegrationService);
  private router = inject(Router);

  state = signal<OnboardingState | null>(null);
  loading = signal(true);
  connecting = signal(false);
  addingSource = signal(false);
  saving = signal(false);
  sourceUrl = signal('');
  loadError = signal<string | null>(null);
  actionError = signal<string | null>(null);

  connected = computed(() => this.state()?.connection?.status === 'ACTIVE');
  sourceConnected = computed(() => !!this.state()?.source);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.onboardingService.getState()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: state => {
          this.state.set(state);
          if (state.completed) this.router.navigate(['/tickets']);
        },
        error: () => this.loadError.set('We could not load your workspace. Check the API and try again.'),
      });
  }

  connectGitHub(): void {
    if (this.connecting()) return;
    this.connecting.set(true);
    this.actionError.set(null);

    this.integrationService.connect('github', '/onboarding')
      .pipe(finalize(() => this.connecting.set(false)))
      .subscribe({
        next: result => {
          if (result.status === 'connected') {
            this.load();
            return;
          }
          this.actionError.set(result.message ?? 'GitHub setup did not finish.');
        },
        error: (error: Error) => this.actionError.set(error.message),
      });
  }

  addSource(): void {
    const workspaceId = this.state()?.defaultWorkspace.id;
    const url = this.sourceUrl().trim();
    if (!workspaceId || !url || this.addingSource()) return;

    this.addingSource.set(true);
    this.actionError.set(null);
    this.onboardingService.addSource(workspaceId, url)
      .pipe(finalize(() => this.addingSource.set(false)))
      .subscribe({
        next: () => {
          this.sourceUrl.set('');
          this.load();
        },
        error: error => this.actionError.set(
          error?.error?.message ?? 'We could not add that source. Check the URL and GitHub access.'
        ),
      });
  }

  complete(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.actionError.set(null);
    this.onboardingService.complete()
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/tickets']),
        error: () => this.actionError.set('We could not finish setup. Try again.'),
      });
  }
}
