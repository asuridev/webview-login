import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { SessionStore } from '../../../core/auth/session.store';

/** Protege `/cards` de acceso directo sin sesión (spec FR-009): sin sesión de asesor con partner activo, vuelve a `/` para disparar el flujo de login/bifurcación. */
export const partnerSessionGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  if (session.status() === 'authenticated' && session.claims()?.partnerSlug) {
    return true;
  }
  return inject(Router).createUrlTree(['/']);
};
