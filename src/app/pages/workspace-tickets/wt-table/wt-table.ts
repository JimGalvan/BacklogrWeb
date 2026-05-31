import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../../models/workspace.model';
import { IconComponent } from '../../../components/ui/icon/icon';

@Component({
  selector: 'app-wt-table',
  imports: [RouterLink, IconComponent],
  templateUrl: './wt-table.html',
  styleUrl: './wt-table.css',
})
export class WtTableComponent {
  tickets = input.required<Ticket[]>();
  workspaceId = input.required<string>();
  search = input<string>('');
  remove = output<Ticket>();

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
