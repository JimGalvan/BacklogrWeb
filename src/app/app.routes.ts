import { Routes } from '@angular/router';
import { TicketsPageComponent } from './pages/tickets/tickets-page';
import { TicketDetailPageComponent } from './pages/ticket-detail/ticket-detail-page';

export const routes: Routes = [
  { path: '',        redirectTo: 'tickets', pathMatch: 'full' },
  { path: 'tickets', component: TicketsPageComponent },
  { path: 'tickets/:key', component: TicketDetailPageComponent },
];
