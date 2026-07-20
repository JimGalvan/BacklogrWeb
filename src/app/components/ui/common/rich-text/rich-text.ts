import { Component, computed, input } from '@angular/core';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { RichTextDoc } from '../../../../models/rich-text.model';
import { adfToHtml } from '../../../../core/utils/adf-to-html';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderRichText(document: RichTextDoc): string {
  const rendered = (() => {
    switch (document.format) {
      case 'ADF':
        return adfToHtml(document.content);
      case 'HTML':
        return document.content;
      case 'MARKDOWN':
        return marked.parse(document.content, { async: false, gfm: true });
      case 'PLAIN_TEXT':
        return escapeHtml(document.content).replace(/\r?\n/g, '<br>');
    }
  })();

  return DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });
}

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.html',
})
export class RichTextComponent {
  doc = input.required<RichTextDoc>();

  readonly html = computed(() => renderRichText(this.doc()));
}
