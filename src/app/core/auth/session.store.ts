import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

import type { AuthClaims } from './auth-claims-model';

export interface SessionUiState {
  status: 'anonymous' | 'authenticating' | 'authenticated' | 'error';
  claims: AuthClaims | null;
  /**
   * `id_token` crudo retenido SOLO en memoria (research R2, FR-010): sirve como
   * `id_token_hint` del RP-initiated logout (requerido por Keycloak < 19).
   * Nunca se persiste (localStorage/cookie) y se limpia en `reset()`.
   */
  idToken: string | null;
}

const initialState: SessionUiState = { status: 'anonymous', claims: null, idToken: null };

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    startAuthenticating(): void {
      patchState(store, { status: 'authenticating' });
    },
    setAuthenticated(claims: AuthClaims, idToken: string): void {
      patchState(store, { status: 'authenticated', claims, idToken });
    },
    setError(): void {
      patchState(store, { status: 'error', claims: null, idToken: null });
    },
    reset(): void {
      patchState(store, initialState);
    },
  })),
);
