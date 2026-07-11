import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const servizioAuth = inject(AuthService);
  const token = servizioAuth.token();

  if (token) {
    const richiestaClonata = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(richiestaClonata);
  }

  return next(req);
};
