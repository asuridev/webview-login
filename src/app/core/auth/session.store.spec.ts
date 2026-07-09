import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SessionStore } from './session.store';
import type { AuthClaims } from './auth-claims-model';

const claims: AuthClaims = {
  subject: 'u-asesor',
  roles: [],
  partnerSlug: 'banco-a',
  isAdmin: false,
};

describe('SessionStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('setAuthenticated retiene el id_token en memoria para el logout', () => {
    const store = TestBed.inject(SessionStore);
    store.setAuthenticated(claims, 'the-id-token');
    expect(store.status()).toBe('authenticated');
    expect(store.idToken()).toBe('the-id-token');
  });

  it('reset limpia el id_token (no queda artefacto de sesión)', () => {
    const store = TestBed.inject(SessionStore);
    store.setAuthenticated(claims, 'the-id-token');
    store.reset();
    expect(store.status()).toBe('anonymous');
    expect(store.idToken()).toBeNull();
    expect(store.claims()).toBeNull();
  });

  it('setError limpia el id_token', () => {
    const store = TestBed.inject(SessionStore);
    store.setAuthenticated(claims, 'the-id-token');
    store.setError();
    expect(store.idToken()).toBeNull();
  });
});
