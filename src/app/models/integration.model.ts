export interface ConnectUrlResponse {
  url: string;
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
    name: 'GitHub Issues',
    description: 'GitHub · repository issue tracking',
    logoInitial: 'G',
    logoClass: 'logo-github',
    comingSoon: true,
  },
];
