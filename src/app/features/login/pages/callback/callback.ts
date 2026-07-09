import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { decodeAuthClaims } from '../../../../core/auth/auth-claims-model';
import { OidcClient } from '../../../../core/auth/oidc-client';
import { clearPkceTransaction, readPkceTransaction } from '../../../../core/auth/pkce-transaction';
import { RoleRedirect } from '../../../../core/auth/role-redirect';
import { SessionStore } from '../../../../core/auth/session.store';

@Component({
  selector: 'app-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <p class="text-sm text-gray-500">Completando el inicio de sesión…</p>
    </div>
  `,
})
export class Callback implements OnInit {
  private router = inject(Router);
  private oidcClient = inject(OidcClient);
  private sessionStore = inject(SessionStore);
  private roleRedirect = inject(RoleRedirect);

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const transaction = readPkceTransaction();

    if (!code || !state || !transaction || state !== transaction.state) {
      this.failAndReturn();
      return;
    }

    this.oidcClient.exchangeCode(code, transaction.codeVerifier).subscribe({
      next: (tokens) => {
        clearPkceTransaction();
        const claims = decodeAuthClaims(tokens.id_token);
        // Se retiene el id_token crudo (en memoria) para usarlo como
        // id_token_hint del logout — Keycloak < 19 lo exige.
        this.sessionStore.setAuthenticated(claims, tokens.id_token);
        this.roleRedirect.redirect(claims);
      },
      error: () => this.failAndReturn(),
    });
  }

  private failAndReturn(): void {
    clearPkceTransaction();
    this.sessionStore.setError();
    void this.router.navigateByUrl('/access-denied');
  }
}
