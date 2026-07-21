import { Component, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  RefinementCategory,
  RefinementEvidence,
  RefinementFinding,
  RefinementFindingsResponse,
} from '../../../models/refinement.model';
import { RefinementService } from '../../../services/refinement.service';
import { IconComponent } from '../../ui/common/icon/icon';

const CATEGORY_LABELS: Record<RefinementCategory, string> = {
  MISSING_ACCEPTANCE_CRITERION: 'Missing acceptance criterion',
  AMBIGUOUS_BEHAVIOR: 'Ambiguous behavior',
  CONTRADICTION: 'Contradiction',
  MISSING_EDGE_CASE: 'Missing edge case',
  DATA_OR_MIGRATION_BEHAVIOR: 'Data or migration',
  API_OR_COMPATIBILITY_RISK: 'API or compatibility',
  SCOPE_OR_DEPENDENCY_GAP: 'Scope or dependency',
  TESTABILITY_GAP: 'Testability gap',
};

@Component({
  selector: 'app-refinement-tab',
  imports: [IconComponent],
  templateUrl: './refinement-tab.html',
  styleUrl: './refinement-tab.css',
})
export class RefinementTabComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  private refinementService = inject(RefinementService);

  readonly result = signal<RefinementFindingsResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly copiedFindingId = signal<string | null>(null);

  run(): void {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.copiedFindingId.set(null);
    this.refinementService.getFindings(workspaceId, ticketKey)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => this.result.set(response),
        error: error => this.errorMessage.set(
          typeof error?.error?.message === 'string'
            ? error.error.message
            : 'Refinement findings could not be generated. Please try again.',
        ),
      });
  }

  categoryLabel(category: RefinementCategory): string {
    return CATEGORY_LABELS[category];
  }

  groundingLabel(result: RefinementFindingsResponse): string {
    return result.grounding === 'TICKET_AND_CODE' ? 'Ticket + code' : 'Ticket only';
  }

  evidenceReference(evidence: RefinementEvidence): string | null {
    switch (evidence.type) {
      case 'COMMENT': return evidence.commentId ? `Comment ${evidence.commentId}` : null;
      case 'IMAGE': return evidence.imageNumber ? `Image ${evidence.imageNumber}` : null;
      case 'SOURCE_FILE': return evidence.path;
      case 'SOURCE_PROFILE': return evidence.sourceName;
      default: return null;
    }
  }

  proposedChangeLabel(finding: RefinementFinding): string {
    return finding.recommendedChange.type === 'CLARIFYING_QUESTION'
      ? 'Clarifying question'
      : 'Acceptance criterion';
  }

  copyProposedChange(finding: RefinementFinding): void {
    void navigator.clipboard.writeText(finding.recommendedChange.text).then(() => {
      this.copiedFindingId.set(finding.id);
      setTimeout(() => {
        if (this.copiedFindingId() === finding.id) this.copiedFindingId.set(null);
      }, 1800);
    });
  }
}
