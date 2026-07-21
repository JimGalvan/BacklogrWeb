import {
  AiResponseFormatError,
  parseRefinementResponse,
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

  it('parses a wrapped TLDR response', () => {
    expect(parseTldrResponse('<tldr><p>Summary</p></tldr>')).toBe('<p>Summary</p>');
  });

  it.each([
    () => parseRefinementResponse('{"refinementAnalysis":{"summary":"missing arrays"}}'),
    () => parseTldrResponse('<p>missing wrapper</p>'),
  ])('rejects malformed model output', parse => {
    expect(parse).toThrow(AiResponseFormatError);
  });
});
