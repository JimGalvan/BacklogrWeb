// Atlassian Document Format (ADF) type definitions.
// We define these locally instead of pulling in @atlaskit/adf-schema, which
// adds ~1.4 MB of ProseMirror dependencies. This covers the nodes Jira sends.

export interface AdfMark {
  type: 'strong' | 'em' | 'code' | 'underline' | 'strike' | 'subsup' | 'link' | 'textColor' | 'backgroundColor';
  attrs?: Record<string, string>;
}

export interface AdfTextNode {
  type: 'text';
  text: string;
  marks?: AdfMark[];
}

export interface AdfHardBreakNode {
  type: 'hardBreak';
}

export interface AdfInlineCardNode {
  type: 'inlineCard';
  attrs: { url: string };
}

export type AdfInlineNode = AdfTextNode | AdfHardBreakNode | AdfInlineCardNode;

export interface AdfParagraphNode {
  type: 'paragraph';
  content?: AdfInlineNode[];
}

export interface AdfHeadingNode {
  type: 'heading';
  attrs: { level: 1 | 2 | 3 | 4 | 5 | 6 };
  content?: AdfInlineNode[];
}

export interface AdfCodeBlockNode {
  type: 'codeBlock';
  attrs?: { language?: string };
  content?: AdfTextNode[];
}

export interface AdfListItemNode {
  type: 'listItem';
  content: AdfBlockNode[];
}

export interface AdfBulletListNode {
  type: 'bulletList';
  content: AdfListItemNode[];
}

export interface AdfOrderedListNode {
  type: 'orderedList';
  attrs?: { order?: number };
  content: AdfListItemNode[];
}

export interface AdfBlockquoteNode {
  type: 'blockquote';
  content: AdfBlockNode[];
}

export interface AdfRuleNode {
  type: 'rule';
}

export interface AdfPanelNode {
  type: 'panel';
  attrs: { panelType: 'info' | 'note' | 'warning' | 'success' | 'error' };
  content: AdfBlockNode[];
}

export interface AdfTableCellNode {
  type: 'tableCell' | 'tableHeader';
  attrs?: Record<string, unknown>;
  content: AdfBlockNode[];
}

export interface AdfTableRowNode {
  type: 'tableRow';
  content: AdfTableCellNode[];
}

export interface AdfTableNode {
  type: 'table';
  content: AdfTableRowNode[];
}

export interface AdfMediaNode {
  type: 'media';
  attrs: { type: string; id?: string; url?: string; alt?: string };
}

export interface AdfMediaSingleNode {
  type: 'mediaSingle';
  content: AdfMediaNode[];
}

export type AdfBlockNode =
  | AdfParagraphNode
  | AdfHeadingNode
  | AdfCodeBlockNode
  | AdfBulletListNode
  | AdfOrderedListNode
  | AdfBlockquoteNode
  | AdfRuleNode
  | AdfPanelNode
  | AdfTableNode
  | AdfMediaSingleNode;

export interface AdfDoc {
  type: 'doc';
  version: number;
  content: AdfBlockNode[];
}
