import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { OidcClient } from '../../../../core/auth/oidc-client';
import { generateCodeChallengeS256, generateCodeVerifier, generateNonce, generateState } from '../../../../core/auth/pkce';
import { savePkceTransaction } from '../../../../core/auth/pkce-transaction';
import { RoleRedirect } from '../../../../core/auth/role-redirect';
import { SessionStore } from '../../../../core/auth/session.store';

@Component({
  selector: 'app-login-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <p class="text-sm text-gray-500">Redirigiendo al inicio de sesión…</p>
    </div>
  `,
})
export class LoginRedirect implements OnInit {
  private sessionStore = inject(SessionStore);
  private oidcClient = inject(OidcClient);
  private roleRedirect = inject(RoleRedirect);

  async ngOnInit(): Promise<void> {
    const session = this.sessionStore;

    // Sesión ya resuelta en memoria (ej. admin que vuelve a '/') → bifurca directo, sin repetir el redirect a la IdP.
    if (session.status() === 'authenticated' && session.claims()) {
      this.roleRedirect.redirect(session.claims()!);
      return;
    }

    // 'authenticating' ⇒ ya hay un redirect en curso; solo 'anonymous'/'error' disparan uno nuevo (permite reintentar tras CT-07).
    if (session.status() !== 'anonymous' && session.status() !== 'error') {
      return;
    }

    session.startAuthenticating();

    const codeVerifier = generateCodeVerifier();
    const state = generateState();
    const nonce = generateNonce();
    const codeChallenge = await generateCodeChallengeS256(codeVerifier);

    savePkceTransaction({ codeVerifier, state, nonce });

    window.location.href = this.oidcClient.buildAuthorizationUrl({ codeChallenge, state, nonce });
  }
}
