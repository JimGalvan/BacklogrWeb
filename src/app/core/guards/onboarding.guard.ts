import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { OnboardingService } from '../../services/onboarding.service';

export const onboardingGuard: CanActivateFn = () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  return onboardingService.getState().pipe(
    map(state => state.completed
      ? true
      : router.createUrlTree(['/onboarding'])),
    catchError(() => of(router.createUrlTree(['/onboarding'])))
  );
};
