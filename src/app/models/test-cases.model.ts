export interface TestCase {
  id: string;
  category: string;
  scenario: string;
  riskCovered: string;
}

export interface TestCasesResponse {
  testCases: TestCase[];
}
