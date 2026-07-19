import { Workspace } from './workspace.model';

export type OnboardingStep = 'CONNECT' | 'SOURCE' | 'TICKET' | 'DONE';

export interface OnboardingSummary {
  id: string;
  displayName: string;
  status: string;
}

export interface OnboardingState {
  completed: boolean;
  suggestedStep: OnboardingStep;
  defaultWorkspace: Workspace;
  connection: OnboardingSummary | null;
  source: OnboardingSummary | null;
  ticket: OnboardingSummary | null;
}
