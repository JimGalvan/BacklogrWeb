import { Component, input, computed } from '@angular/core';
import { TicketComment } from '../../models/workspace.model';
import { AvatarComponent } from '../avatar/avatar';
import { RichTextComponent } from '../rich-text/rich-text';
import { AvatarVariant } from '../../models/ticket.model';

@Component({
  selector: 'app-comment',
  imports: [AvatarComponent, RichTextComponent],
  templateUrl: './comment.html',
  styleUrl: './comment.css',
})
export class CommentComponent {
  comment = input.required<TicketComment>();

  initials = computed(() => {
    const name = this.comment().authorName || this.comment().authorEmail;
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  });

  avatarVariant = computed((): AvatarVariant => {
    const code = this.comment().authorName.charCodeAt(0) % 3;
    return (['a', 'b', 'c'] as AvatarVariant[])[code];
  });

  formattedDate = computed(() => {
    return new Date(this.comment().createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  });

  richTextDoc = computed(() => ({
    format: 'adf' as const,
    content: this.comment().body,
  }));
}
