
export class AiResponseFormatError extends Error {
  constructor(message = 'The AI returned an unreadable response. Please try again.') {
    super(message);
    this.name = 'AiResponseFormatError';
  }
}

export function parseTldrResponse(raw: string): string {
  const match = raw.match(/<tldr>([\s\S]*?)<\/tldr>/);
  if (!match || !match[1].trim()) throw new AiResponseFormatError();
  return match[1].trim();
}
