import { Routes } from '@angular/router';
import { ShellComponent } from './components/layout/shell/shell';
import { LoginPageComponent } from './pages/login/login-page';
import { RegisterPageComponent } from './pages/register/register-page';
import { TicketsPageComponent } from './pages/tickets/tickets-page';
import { TicketDetailPageComponent } from './pages/ticket-detail/ticket-detail-page';
import { IntegrationsPageComponent } from './pages/integrations/integrations-page';
import { IntegrationCallbackPageComponent } from './pages/integrations/callback/integration-callback-page';
import { WorkspacesPageComponent } from './pages/workspaces/workspaces-page';
import { TicketsPageComponent as WorkspaceTicketsPageComponent } from './pages/workspace-tickets/workspace-tickets-page';
import { OnboardingPageComponent } from './pages/onboarding/onboarding-page';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  { path: 'login',    component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'integrations/callback', component: IntegrationCallbackPageComponent },
  { path: 'onboarding', component: OnboardingPageComponent, canActivate: [authGuard] },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard, onboardingGuard],
    children: [
      { path: '',                        redirectTo: 'tickets', pathMatch: 'full' },
      { path: 'tickets',                 component: TicketsPageComponent },
      { path: 'tickets/:key',            component: TicketDetailPageComponent },
      { path: 'integrations',            component: IntegrationsPageComponent },
      { path: 'workspaces',                              component: WorkspacesPageComponent },
      { path: 'workspaces/:workspaceId/tickets',                    component: WorkspaceTicketsPageComponent },
      { path: 'workspaces/:workspaceId/tickets/:ticketKey',         component: TicketDetailPageComponent },
    ],
  },
];
