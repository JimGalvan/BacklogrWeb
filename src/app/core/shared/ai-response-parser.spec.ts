import {
  AiResponseFormatError,
  parseTldrResponse,
} from './ai-response-parser';

describe('AI response contracts', () => {
  it('parses a wrapped TLDR response', () => {
    expect(parseTldrResponse('<tldr><p>Summary</p></tldr>')).toBe('<p>Summary</p>');
  });

  it.each([
    () => parseTldrResponse('<p>missing wrapper</p>'),
  ])('rejects malformed model output', parse => {
    expect(parse).toThrow(AiResponseFormatError);
  });
});
