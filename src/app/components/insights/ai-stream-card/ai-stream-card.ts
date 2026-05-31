import { Component, input, output } from '@angular/core';
import { IconComponent } from '../../ui/icon/icon';

@Component({
  selector: 'app-ai-stream-card',
  imports: [IconComponent],
  templateUrl: './ai-stream-card.html',
  styleUrl: './ai-stream-card.css',
})
export class AiStreamCardComponent {
  title = input.required<string>();
  idleText = input.required<string>();
  runLabel = input.required<string>();
  isStreaming = input(false);
  isDone = input(false);
  isError = input(false);
  hasContent = input(false);

  run = output<void>();
}
