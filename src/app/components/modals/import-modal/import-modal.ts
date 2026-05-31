import { Component, inject, Input, output, signal } from '@angular/core';
import { WorkspaceService } from '../../../services/workspace.service';
import { ModalShellComponent } from '../../ui/common/modal-shell/modal-shell';
import { ImportUrlTabComponent } from './url-tab/url-tab';
import { ImportConnectTabComponent } from './connect-tab/connect-tab';

type ModalTab = 'url' | 'connect';

@Component({
  selector: 'app-import-modal',
  imports: [ModalShellComponent, ImportUrlTabComponent, ImportConnectTabComponent],
  templateUrl: './import-modal.html',
  styleUrl: './import-modal.css',
})
export class ImportModalComponent {
  private workspaceService = inject(WorkspaceService);

  @Input() workspaceId = '';
  close = output<void>();
  imported = output<void>();

  activeTab = signal<ModalTab>('url');
  urlValue = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showConnectHint = signal(false);

  importFromUrl(url?: string) {
    const target = url ?? this.urlValue();
    if (!target || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.showConnectHint.set(false);

    if (!this.workspaceId) {
      this.isLoading.set(false);
      this.errorMessage.set('Open a workspace first, then import from there.');
      return;
    }

    this.workspaceService.importTicket(this.workspaceId, { url: target }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close.emit();
        this.imported.emit();
      },
      error: (err: { status: number; error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Import failed. Please try again.');
        if (err.status === 400 && err.error?.message?.toLowerCase().includes('connect')) {
          this.showConnectHint.set(true);
        }
      },
    });
  }
}
