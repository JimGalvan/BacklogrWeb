import { Component, input } from '@angular/core';
import { AvatarVariant } from '../../models/ticket.model';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class AvatarComponent {
  initials = input.required<string>();
  variant = input<AvatarVariant>('a');
  size = input<number>(28);
}
