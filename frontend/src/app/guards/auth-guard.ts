import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const servizioAuth = inject(AuthService);
  const router = inject(Router);

  if (servizioAuth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};