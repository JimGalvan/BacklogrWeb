import { AdfDoc } from './adf.model';

// Provider-agnostic rich text document. Each variant carries the raw content
// from its source so rendering is deferred to the view layer.
export type RichTextDoc =
  | { format: 'adf';      content: AdfDoc }
  | { format: 'html';     content: string }
  | { format: 'markdown'; content: string };
