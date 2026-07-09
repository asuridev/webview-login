import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

import type { AuthClaims } from './auth-claims-model';

export interface SessionUiState {
  status: 'anonymous' | 'authenticating' | 'authenticated' | 'error';
  claims: AuthClaims | null;
}

const initialState: SessionUiState = { status: 'anonymous', claims: null };

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    startAuthenticating(): void {
      patchState(store, { status: 'authenticating' });
    },
    setAuthenticated(claims: AuthClaims): void {
      patchState(store, { status: 'authenticated', claims });
    },
    setError(): void {
      patchState(store, { status: 'error', claims: null });
    },
    reset(): void {
      patchState(store, initialState);
    },
  })),
);
