import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketListItem } from '../../models/ticket.model';
import { AvatarComponent } from '../avatar/avatar';
import { PriorityChipComponent } from '../priority-chip/priority-chip';
import { StatusChipComponent } from '../status-chip/status-chip';

@Component({
  selector: 'app-ticket-row',
  imports: [RouterLink, AvatarComponent, PriorityChipComponent, StatusChipComponent],
  templateUrl: './ticket-row.html',
  styleUrl: './ticket-row.css',
})
export class TicketRowComponent {
  ticket = input.required<TicketListItem>();
  remove = output<string>();
}
