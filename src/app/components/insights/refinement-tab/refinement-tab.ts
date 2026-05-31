import { Component, DestroyRef, inject, input } from '@angular/core';
import { AiService } from '../../../services/ai.service';
import { RefinementAnalysis, RefinementAnalysisResponse } from '../../../models/refinement.model';
import { AiStreamController } from '../../../core/shared/ai-stream-controller';
import { AiStreamCardComponent } from '../ai-stream-card/ai-stream-card';
import { RefinementSectionComponent } from '../refinement-section/refinement-section';
import { IconComponent } from '../../ui/common/icon/icon';

type RefinementSectionKey = keyof Omit<RefinementAnalysis, 'summary'>;

const REFINEMENT_SECTIONS: { title: string; key: RefinementSectionKey }[] = [
  { title: 'Open Questions',           key: 'openQuestions' },
  { title: 'Scope Clarifications',     key: 'scopeClarifications' },
  { title: 'Risks & Edge Cases',       key: 'risksAndEdgeCases' },
  { title: 'Acceptance Criteria Gaps', key: 'acceptanceCriteriaGaps' },
];

@Component({
  selector: 'app-refinement-tab',
  imports: [AiStreamCardComponent, RefinementSectionComponent, IconComponent],
  templateUrl: './refinement-tab.html',
  styleUrl: './refinement-tab.css',
})
export class RefinementTabComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  private aiService = inject(AiService);

  readonly sections = REFINEMENT_SECTIONS;
  readonly stream = new AiStreamController<RefinementAnalysis>(
    (workspaceId, ticketKey) => this.aiService.streamRefinement(workspaceId, ticketKey),
    raw => (JSON.parse(raw) as RefinementAnalysisResponse).refinementAnalysis,
    inject(DestroyRef),
  );

  run(): void {
    this.stream.start(this.workspaceId(), this.ticketKey());
  }
}
