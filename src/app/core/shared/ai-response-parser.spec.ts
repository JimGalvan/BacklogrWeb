import {
  AiResponseFormatError,
  parseRefinementResponse,
  parseTestCasesResponse,
  parseTldrResponse,
} from './ai-response-parser';

describe('AI response contracts', () => {
  it('parses the refinement response expected by the UI', () => {
    const analysis = parseRefinementResponse(JSON.stringify({
      refinementAnalysis: {
        summary: 'Ready after one clarification.',
        openQuestions: [{title: 'Owner', description: 'Confirm the owner.'}],
        scopeClarifications: [],
        risksAndEdgeCases: [],
        acceptanceCriteriaGaps: [],
      },
    }));

    expect(analysis.summary).toBe('Ready after one clarification.');
    expect(analysis.openQuestions).toHaveLength(1);
  });

  it('parses the test-case response expected by the UI', () => {
    const testCases = parseTestCasesResponse(JSON.stringify({
      testCases: [{
        id: 'TC-01',
        category: 'Integration Testing',
        scenario: 'Import the issue.',
        riskCovered: 'Provider data is mapped incorrectly.',
      }],
    }));

    expect(testCases[0].id).toBe('TC-01');
  });

  it('parses a wrapped TLDR response', () => {
    expect(parseTldrResponse('<tldr><p>Summary</p></tldr>')).toBe('<p>Summary</p>');
  });

  it.each([
    () => parseRefinementResponse('{"refinementAnalysis":{"summary":"missing arrays"}}'),
    () => parseTestCasesResponse('{"testCases":[{"id":"TC-01"}]}'),
    () => parseTldrResponse('<p>missing wrapper</p>'),
  ])('rejects malformed model output', parse => {
    expect(parse).toThrow(AiResponseFormatError);
  });
});
