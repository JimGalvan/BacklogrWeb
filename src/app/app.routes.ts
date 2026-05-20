import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell';
import { LoginPageComponent } from './pages/login/login-page';
import { RegisterPageComponent } from './pages/register/register-page';
import { TicketsPageComponent } from './pages/tickets/tickets-page';
import { TicketDetailPageComponent } from './pages/ticket-detail/ticket-detail-page';
import { IntegrationsPageComponent } from './pages/integrations/integrations-page';
import { IntegrationCallbackPageComponent } from './pages/integrations/callback/integration-callback-page';
import { WorkspacesPageComponent } from './pages/workspaces/workspaces-page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',    component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '',                        redirectTo: 'tickets', pathMatch: 'full' },
      { path: 'tickets',                 component: TicketsPageComponent },
      { path: 'tickets/:key',            component: TicketDetailPageComponent },
      { path: 'integrations',            component: IntegrationsPageComponent },
      { path: 'integrations/callback',   component: IntegrationCallbackPageComponent },
      { path: 'workspaces',              component: WorkspacesPageComponent },
    ],
  },
];
