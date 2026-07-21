import { Component, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { RelevantFile, RelevantFilesResponse } from '../../../models/relevant-files.model';
import { RelevantFilesService } from '../../../services/relevant-files.service';
import { IconComponent } from '../../ui/common/icon/icon';

@Component({
  selector: 'app-relevant-files-tab',
  imports: [IconComponent],
  templateUrl: './relevant-files-tab.html',
  styleUrl: './relevant-files-tab.css',
})
export class RelevantFilesTabComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  private relevantFilesService = inject(RelevantFilesService);
  private loaded = false;

  readonly result = signal<RelevantFilesResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly focusedPath = signal<string | null>(null);
  readonly focusNotice = signal('');

  private pendingFocusPath: string | null = null;

  load(): void {
    if (this.loaded) return;
    this.refresh();
  }

  refresh(): void {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.relevantFilesService.getRelevantFiles(workspaceId, ticketKey)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: result => {
          this.result.set(result);
          this.loaded = true;
          this.applyPendingFocus();
        },
        error: error => {
          this.errorMessage.set(
            typeof error?.error?.message === 'string'
              ? error.error.message
              : 'Relevant files could not be loaded. Please try again.',
          );
        },
      });
  }

  focusFile(path: string): void {
    this.pendingFocusPath = path;
    if (this.loaded && !this.loading()) {
      this.applyPendingFocus();
    } else {
      this.load();
    }
  }

  isFocused(file: RelevantFile): boolean {
    return this.focusedPath() === file.path;
  }

  private applyPendingFocus(): void {
    const path = this.pendingFocusPath;
    this.pendingFocusPath = null;
    if (!path) return;

    const present = (this.result()?.files ?? []).some(file => file.path === path);
    if (present) {
      this.focusedPath.set(path);
      this.focusNotice.set('');
      setTimeout(() => {
        document.getElementById('relevant-file-' + path)?.scrollIntoView({ block: 'nearest' });
      });
    } else {
      this.focusedPath.set(null);
      this.focusNotice.set(
        'That file is not among the top relevant files for this ticket, so its excerpt is not shown here.',
      );
    }
  }

  fileType(file: RelevantFile): string {
    const name = file.path.split('/').pop() ?? file.path;
    const extension = name.includes('.') ? name.split('.').pop() : null;
    return extension?.toUpperCase() || 'FILE';
  }

  revisionLabel(revision: string | null): string {
    return revision ? revision.slice(0, 8) : 'current index';
  }

  lineLabel(startLine: number | null, endLine: number | null): string {
    if (startLine == null) return 'Relevant excerpt';
    return endLine != null && endLine !== startLine
      ? `Lines ${startLine}–${endLine}`
      : `Line ${startLine}`;
  }
}
