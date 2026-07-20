import { Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html.pipe';
import { RichTextDoc } from '../../../../models/rich-text.model';
import { adfToHtml } from '../../../../core/utils/adf-to-html';

@Component({
  selector: 'app-rich-text',
  imports: [SafeHtmlPipe],
  templateUrl: './rich-text.html',
})
export class RichTextComponent {
  doc = input.required<RichTextDoc>();

  readonly html = computed(() => {
    const document = this.doc();
    switch (document.format) {
      case 'ADF':        return adfToHtml(document.content);
      case 'HTML':       return document.content;
      case 'MARKDOWN':   return document.content;
      case 'PLAIN_TEXT': return document.content;
    }
  });
}
