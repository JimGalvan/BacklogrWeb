import { RefinementAnalysis, RefinementAnalysisResponse, RefinementItem } from '../../models/refinement.model';
import { TestCase, TestCasesResponse } from '../../models/test-cases.model';

export class AiResponseFormatError extends Error {
  constructor(message = 'The AI returned an unreadable response. Please try again.') {
    super(message);
    this.name = 'AiResponseFormatError';
  }
}

export function parseRefinementResponse(raw: string): RefinementAnalysis {
  const response = parseJson(raw) as Partial<RefinementAnalysisResponse>;
  const analysis = response.refinementAnalysis;
  if (!isRecord(analysis) || typeof analysis['summary'] !== 'string') {
    throw new AiResponseFormatError();
  }

  const sections = [
    'openQuestions',
    'scopeClarifications',
    'risksAndEdgeCases',
    'acceptanceCriteriaGaps',
  ] as const;
  for (const section of sections) {
    if (!isRefinementItems(analysis[section])) throw new AiResponseFormatError();
  }
  return analysis as unknown as RefinementAnalysis;
}

export function parseTestCasesResponse(raw: string): TestCase[] {
  const response = parseJson(raw) as Partial<TestCasesResponse>;
  if (!Array.isArray(response.testCases) || !response.testCases.every(isTestCase)) {
    throw new AiResponseFormatError();
  }
  return response.testCases;
}

export function parseTldrResponse(raw: string): string {
  const match = raw.match(/<tldr>([\s\S]*?)<\/tldr>/);
  if (!match || !match[1].trim()) throw new AiResponseFormatError();
  return match[1].trim();
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new AiResponseFormatError();
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRefinementItems(value: unknown): value is RefinementItem[] {
  return Array.isArray(value) && value.every(item =>
    isRecord(item)
    && typeof item['title'] === 'string'
    && typeof item['description'] === 'string'
  );
}

function isTestCase(value: unknown): value is TestCase {
  return isRecord(value)
    && typeof value['id'] === 'string'
    && typeof value['category'] === 'string'
    && typeof value['scenario'] === 'string'
    && typeof value['riskCovered'] === 'string';
}
