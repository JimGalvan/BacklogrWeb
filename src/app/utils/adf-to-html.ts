import {
  AdfBlockNode,
  AdfBlockquoteNode,
  AdfDoc,
  AdfInlineNode,
  AdfListItemNode,
  AdfMark,
  AdfPanelNode,
  AdfTableCellNode,
  AdfTableNode,
  AdfTableRowNode,
} from '../models/adf.model';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyMarks(text: string, marks: AdfMark[] = []): string {
  return marks.reduce((result, mark) => {
    switch (mark.type) {
      case 'strong':     return `<strong>${result}</strong>`;
      case 'em':         return `<em>${result}</em>`;
      case 'code':       return `<code>${result}</code>`;
      case 'underline':  return `<u>${result}</u>`;
      case 'strike':     return `<s>${result}</s>`;
      case 'subsup':
        return mark.attrs?.['type'] === 'sub' ? `<sub>${result}</sub>` : `<sup>${result}</sup>`;
      case 'link': {
        const href = escapeHtml(mark.attrs?.['href'] ?? '#');
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${result}</a>`;
      }
      case 'textColor': {
        const color = escapeHtml(mark.attrs?.['color'] ?? '');
        return `<span style="color:${color}">${result}</span>`;
      }
      case 'backgroundColor': {
        const color = escapeHtml(mark.attrs?.['color'] ?? '');
        return `<span style="background-color:${color}">${result}</span>`;
      }
      default: return result;
    }
  }, text);
}

function renderInlineNodes(nodes: AdfInlineNode[] = []): string {
  return nodes.map(node => {
    switch (node.type) {
      case 'text':
        return applyMarks(escapeHtml(node.text), node.marks);
      case 'hardBreak':
        return '<br>';
      case 'inlineCard':
        return `<a href="${escapeHtml(node.attrs.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(node.attrs.url)}</a>`;
      default:
        return '';
    }
  }).join('');
}

function renderListItems(items: AdfListItemNode[]): string {
  return items.map(item => {
    // Unwrap single-paragraph items to avoid a bare <p> inside <li>
    if (item.content.length === 1 && item.content[0].type === 'paragraph') {
      return `<li>${renderInlineNodes(item.content[0].content)}</li>`;
    }
    return `<li>${renderBlockNodes(item.content)}</li>`;
  }).join('');
}

function renderBlockNodes(nodes: AdfBlockNode[]): string {
  return nodes.map(node => {
    switch (node.type) {
      case 'paragraph':
        return `<p>${renderInlineNodes(node.content)}</p>`;

      case 'heading': {
        const level = node.attrs.level;
        return `<h${level}>${renderInlineNodes(node.content)}</h${level}>`;
      }

      case 'codeBlock': {
        const languageClass = node.attrs?.language
          ? ` class="language-${escapeHtml(node.attrs.language)}"`
          : '';
        const code = (node.content ?? []).map(textNode => escapeHtml(textNode.text)).join('');
        return `<pre><code${languageClass}>${code}</code></pre>`;
      }

      case 'bulletList':
        return `<ul>${renderListItems(node.content)}</ul>`;

      case 'orderedList': {
        const startAttr = node.attrs?.order ? ` start="${node.attrs.order}"` : '';
        return `<ol${startAttr}>${renderListItems(node.content)}</ol>`;
      }

      case 'blockquote':
        return `<blockquote>${renderBlockNodes((node as AdfBlockquoteNode).content)}</blockquote>`;

      case 'rule':
        return '<hr>';

      case 'panel': {
        const panelNode = node as AdfPanelNode;
        return `<div class="adf-panel adf-panel--${panelNode.attrs.panelType}">${renderBlockNodes(panelNode.content)}</div>`;
      }

      case 'table': {
        const tableNode = node as AdfTableNode;
        const rows = (tableNode.content as AdfTableRowNode[]).map(row => {
          const cells = (row.content as AdfTableCellNode[]).map(cell => {
            const tag = cell.type === 'tableHeader' ? 'th' : 'td';
            return `<${tag}>${renderBlockNodes(cell.content)}</${tag}>`;
          }).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        return `<table class="adf-table">${rows}</table>`;
      }

      case 'mediaSingle':
        return '';

      default:
        return '';
    }
  }).join('');
}

export function adfToHtml(doc: AdfDoc): string {
  return renderBlockNodes(doc.content);
}
