export interface ConnectUrlResponse {
  url: string;
}

export interface ConnectionAuthorizationResponse extends ConnectUrlResponse {
  provider: string;
  expiresAt: string;
}

export type ConnectionResultStatus = 'connected' | 'error' | 'cancelled';

export interface ConnectionResult {
  type: 'backlogr:connection-result';
  provider: string;
  status: ConnectionResultStatus;
  message?: string;
  returnPath?: string;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  logoInitial: string;
  logoClass: string;
  comingSoon?: boolean;
}

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Atlassian · project tracking & issue management',
    logoInitial: 'J',
    logoClass: 'logo-jira',
    comingSoon: true,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Linear · modern software planning',
    logoInitial: 'L',
    logoClass: 'logo-linear',
    comingSoon: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub · repository context and issue tracking',
    logoInitial: 'G',
    logoClass: 'logo-github',
  },
];
