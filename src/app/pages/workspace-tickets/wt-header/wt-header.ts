import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../components/ui/icon/icon';

@Component({
  selector: 'app-wt-header',
  imports: [RouterLink, IconComponent],
  templateUrl: './wt-header.html',
  styleUrl: './wt-header.css',
})
export class WtHeaderComponent {
  workspaceName = input.required<string>();
  importTicket = output<void>();
}
