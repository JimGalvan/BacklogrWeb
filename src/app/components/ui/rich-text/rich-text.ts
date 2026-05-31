import { Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { RichTextDoc } from '../../../models/rich-text.model';
import { adfToHtml } from '../../../utils/adf-to-html';

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
      case 'adf':      return adfToHtml(document.content);
      case 'html':     return document.content;
      case 'markdown': return document.content;
    }
  });
}
