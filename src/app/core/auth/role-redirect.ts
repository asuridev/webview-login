import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import type { AuthClaims } from './auth-claims-model';

@Injectable({ providedIn: 'root' })
export class RoleRedirect {
  private router = inject(Router);

  /** Bifurca la navegación según `claims` — admin sale de la app; asesor con/sin partner se resuelve dentro de `webview-login` (spec FR-003/FR-004/FR-006). */
  redirect(claims: AuthClaims): void {
    if (claims.isAdmin) {
      window.location.href = `${environment.transversalBaseUrl}/api/auth/login?module=admin`;
      return;
    }
    if (claims.partnerSlug) {
      void this.router.navigateByUrl('/cards');
      return;
    }
    void this.router.navigateByUrl('/access-denied');
  }
}
