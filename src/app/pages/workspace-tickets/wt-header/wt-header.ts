import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../components/ui/common/icon/icon';
import { Workspace } from '../../../models/workspace.model';

@Component({
  selector: 'app-wt-header',
  imports: [RouterLink, IconComponent],
  templateUrl: './wt-header.html',
  styleUrl: './wt-header.css',
})
export class WtHeaderComponent {
  workspaces = input.required<Workspace[]>();
  workspaceId = input.required<string>();
  workspaceName = input.required<string>();
  workspaceChange = output<string>();
  importTicket = output<void>();

  onWorkspaceChange(event: Event): void {
    this.workspaceChange.emit((event.target as HTMLSelectElement).value);
  }
}
