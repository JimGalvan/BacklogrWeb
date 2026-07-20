export interface ConnectUrlResponse {
  url: string;
}

export interface ConnectionAuthorizationResponse extends ConnectUrlResponse {
  provider: string;
  expiresAt: string;
}

export type ConnectionResultStatus = 'connected' | 'error' | 'cancelled';

/** postMessage type used between the OAuth callback popup and the opener window. */
export const CONNECTION_RESULT_MESSAGE_TYPE = 'backlogr:connection-result';

export interface ConnectionResult {
  type: typeof CONNECTION_RESULT_MESSAGE_TYPE;
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
