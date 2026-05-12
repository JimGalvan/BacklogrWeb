import { Component, input } from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-stack-trace',
  imports: [SafeHtmlPipe],
  templateUrl: './stack-trace.html',
  styleUrl: './stack-trace.css',
})
export class StackTraceComponent {
  html = input.required<string>();
  label = input<string>('STACK TRACE');
}
