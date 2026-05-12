import { Component, input } from '@angular/core';
import { TicketComment } from '../../models/ticket.model';
import { AvatarComponent } from '../avatar/avatar';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-comment',
  imports: [AvatarComponent, SafeHtmlPipe],
  templateUrl: './comment.html',
  styleUrl: './comment.css',
})
export class CommentComponent {
  comment = input.required<TicketComment>();
}
