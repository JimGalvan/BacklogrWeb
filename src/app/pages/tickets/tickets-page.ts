import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../components/ui/common/empty-state/empty-state';

@Component({
  selector: 'app-tickets-page',
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './tickets-page.html',
  styleUrl: './tickets-page.css',
})
export class TicketsPageComponent {}
