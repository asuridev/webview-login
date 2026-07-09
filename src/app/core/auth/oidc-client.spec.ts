import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OidcClient } from './oidc-client';
import { environment } from '../../../environments/environment';

describe('OidcClient.buildEndSessionUrl', () => {
  let client: OidcClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(OidcClient);
  });

  it('incluye client_id y post_logout_redirect_uri siempre', () => {
    const url = new URL(client.buildEndSessionUrl());
    expect(url.origin + url.pathname).toBe(new URL(environment.idpEndSessionEndpoint).origin + new URL(environment.idpEndSessionEndpoint).pathname);
    expect(url.searchParams.get('client_id')).toBe(environment.oidcClientId);
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe(window.location.origin);
  });

  it('incluye id_token_hint cuando se provee (Keycloak < 19 lo exige)', () => {
    const url = new URL(client.buildEndSessionUrl('the-id-token'));
    expect(url.searchParams.get('id_token_hint')).toBe('the-id-token');
  });

  it('omite id_token_hint cuando no se provee', () => {
    const url = new URL(client.buildEndSessionUrl());
    expect(url.searchParams.has('id_token_hint')).toBe(false);
  });
});
