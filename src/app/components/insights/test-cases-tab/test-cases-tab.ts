import { Component, DestroyRef, inject, input } from '@angular/core';
import { AiService } from '../../../services/ai.service';
import { TestCases, TestCasesResponse } from '../../../models/test-cases.model';
import { AiStreamController } from '../../../shared/ai-stream-controller';
import { AiStreamCardComponent } from '../ai-stream-card/ai-stream-card';
import { TestCaseSectionComponent } from '../test-case-section/test-case-section';
import { IconComponent } from '../../ui/icon/icon';

const TEST_CASE_CATEGORIES: { title: string; key: keyof TestCases }[] = [
  { title: 'Integration Testing', key: 'integrationTesting' },
  { title: 'System Testing',      key: 'systemTesting' },
  { title: 'End-to-End Testing',  key: 'endToEndTesting' },
  { title: 'Regression Testing',  key: 'regressionTesting' },
  { title: 'Negative Testing',    key: 'negativeTesting' },
  { title: 'Security Testing',    key: 'securityTesting' },
];

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

  readonly categories = TEST_CASE_CATEGORIES;
  readonly stream = new AiStreamController<TestCases>(
    (workspaceId, ticketKey) => this.aiService.streamTestCases(workspaceId, ticketKey),
    raw => (JSON.parse(raw) as TestCasesResponse).testCases,
    inject(DestroyRef),
  );

  run(): void {
    this.stream.start(this.workspaceId(), this.ticketKey());
  }
}
