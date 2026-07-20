import {Component, computed, DestroyRef, inject, input} from '@angular/core';
import {AiService} from '../../../services/ai.service';
import {TestCase} from '../../../models/test-cases.model';
import {AiStreamController} from '../../../core/shared/ai-stream-controller';
import {parseTestCasesResponse} from '../../../core/shared/ai-response-parser';
import {AiStreamCardComponent} from '../ai-stream-card/ai-stream-card';
import {TestCaseSectionComponent} from '../test-case-section/test-case-section';
import {IconComponent} from '../../ui/common/icon/icon';


@Component({
  selector: 'app-test-cases-tab',
  imports: [AiStreamCardComponent, TestCaseSectionComponent, IconComponent],
  templateUrl: './test-cases-tab.html',
  styleUrl: './test-cases-tab.css',
})
export class TestCasesTabComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  private aiService = inject(AiService);

  readonly stream = new AiStreamController<TestCase[]>(
    (workspaceId, ticketKey) => this.aiService.streamTestCases(workspaceId, ticketKey),
    parseTestCasesResponse,
    inject(DestroyRef),
  );

  readonly testCaseGroups = computed(() => {
    const groups = new Map<string, TestCase[]>();
    for (const testCase of this.stream.data() ?? []) {
      const group = groups.get(testCase.category) ?? [];
      group.push(testCase);
      groups.set(testCase.category, group);
    }
    return [...groups.entries()].map(([category, testCases]) => ({category, testCases}));
  });

  run(): void {
    this.stream.start(this.workspaceId(), this.ticketKey());
  }
}
