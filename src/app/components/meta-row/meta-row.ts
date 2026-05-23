import { Component, input } from '@angular/core';
import { MockTicket } from '../../models/ticket.model';
import { AvatarComponent } from '../avatar/avatar';
import { StatusChipComponent } from '../status-chip/status-chip';
import { TagComponent } from '../tag/tag';

@Component({
  selector: 'app-meta-row',
  imports: [AvatarComponent, StatusChipComponent, TagComponent],
  templateUrl: './meta-row.html',
  styleUrl: './meta-row.css',
})
export class MetaRowComponent {
  ticket = input.required<MockTicket>();
}
