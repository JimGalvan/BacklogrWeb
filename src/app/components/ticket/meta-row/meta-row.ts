import { Component, input } from '@angular/core';
import { Ticket } from '../../../models/workspace.model';
import { AvatarVariant } from '../../../models/ticket.model';
import { AvatarComponent } from '../../ui/profile/avatar/avatar';
import { StatusChipComponent } from '../../ui/common/status-chip/status-chip';
import { TagComponent } from '../../ui/common/tag/tag';

@Component({
  selector: 'app-meta-row',
  imports: [AvatarComponent, StatusChipComponent, TagComponent],
  templateUrl: './meta-row.html',
  styleUrl: './meta-row.css',
})
export class MetaRowComponent {
  ticket = input.required<Ticket>();

  avatarVariant(color: string): AvatarVariant {
    const map: Record<string, AvatarVariant> = { purple: 'a', teal: 'b', amber: 'c' };
    return map[color] ?? 'a';
  }
}
