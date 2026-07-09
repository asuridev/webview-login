import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AuthorizationRequestParams {
  readonly codeChallenge: string;
  readonly state: string;
  readonly nonce: string;
}

export interface TokenResponse {
  readonly access_token: string;
  readonly id_token: string;
  readonly token_type: string;
  readonly expires_in: number;
}

function redirectUri(): string {
  return `${window.location.origin}/callback`;
}

@Injectable({ providedIn: 'root' })
export class OidcClient {
  private http = inject(HttpClient);

  /** Construye la URL de autorización del reino `backoffice`. Sin `prompt=login` — permite silent SSO (spec FR-002). */
  buildAuthorizationUrl(params: AuthorizationRequestParams): string {
    const url = new URL(environment.idpAuthorizationEndpoint);
    url.searchParams.set('client_id', environment.oidcClientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri());
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('code_challenge', params.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', params.state);
    url.searchParams.set('nonce', params.nonce);
    return url.toString();
  }

  /** Construye la URL de fin de sesión del reino (logout RP-initiated). Devuelve al usuario a webview-login vía `post_logout_redirect_uri` (CLAUDE.md §5). */
  buildEndSessionUrl(): string {
    const url = new URL(environment.idpEndSessionEndpoint);
    url.searchParams.set('client_id', environment.oidcClientId);
    url.searchParams.set('post_logout_redirect_uri', window.location.origin);
    return url.toString();
  }

  /** Intercambia `code` por tokens contra el `token_endpoint` — cliente público, sin `client_secret` (research.md R1). */
  exchangeCode(code: string, codeVerifier: string): Observable<TokenResponse> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', environment.oidcClientId)
      .set('code', code)
      .set('redirect_uri', redirectUri())
      .set('code_verifier', codeVerifier);

    return this.http.post<TokenResponse>(environment.idpTokenEndpoint, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
