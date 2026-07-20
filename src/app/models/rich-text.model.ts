import { AdfDoc } from './adf.model';

// Provider-agnostic rich text document. Each variant carries the raw content
// from its source so rendering is deferred to the view layer.
export type RichTextDoc =
  | { format: 'ADF';        content: AdfDoc }
  | { format: 'HTML';       content: string }
  | { format: 'MARKDOWN';   content: string }
  | { format: 'PLAIN_TEXT'; content: string };
