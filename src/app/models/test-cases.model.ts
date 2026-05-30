export interface TestCase {
  id: string;
  scenario: string;
  expectedOutcome: string;
  riskCovered: string;
}

export interface TestCases {
  integrationTesting: TestCase[];
  systemTesting: TestCase[];
  endToEndTesting: TestCase[];
  regressionTesting: TestCase[];
  negativeTesting: TestCase[];
  securityTesting: TestCase[];
}

export interface TestCasesResponse {
  testCases: TestCases;
}
