import { Component, input } from '@angular/core';
import { TestCase } from '../../../models/test-cases.model';

@Component({
  selector: 'app-test-case-section',
  imports: [],
  templateUrl: './test-case-section.html',
  styleUrl: './test-case-section.css',
})
export class TestCaseSectionComponent {
  title = input.required<string>();
  testCases = input.required<TestCase[]>();
}
