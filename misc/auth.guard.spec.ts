import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';
import Keycloak from 'keycloak-js';

import { authGuard } from './auth.guard';

/**
 * authGuard se construye con createAuthGuard(isAccessAllowed) de
 * keycloak-angular. Esa factory se encarga de resolver AuthGuardData
 * (authenticated / grantedRoles) a partir de la instancia de Keycloak
 * inyectada. Por eso aquí controlamos el estado a través del propio
 * mock de Keycloak: `authenticated` en la instancia.
 */
describe('authGuard', () => {
  let keycloakSpy: jasmine.SpyObj<Keycloak>;

  const runGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) =>
    TestBed.runInInjectionContext(() =>
      (authGuard as CanActivateFn)(route, state),
    );

  beforeEach(() => {
    keycloakSpy = jasmine.createSpyObj<Keycloak>(
      'Keycloak',
      ['login'],
      { authenticated: false },
    );
    keycloakSpy.login.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: keycloakSpy }],
    });
  });

  it('debe permitir el acceso cuando el usuario está autenticado', async () => {
    (keycloakSpy as any).authenticated = true;
    const state = { url: '/dashboard' } as RouterStateSnapshot;

    const result = await runGuard({} as ActivatedRouteSnapshot, state);

    expect(result).toBe(true);
    expect(keycloakSpy.login).not.toHaveBeenCalled();
  });

  it('debe redirigir al login cuando el usuario NO está autenticado', async () => {
    (keycloakSpy as any).authenticated = false;
    const state = { url: '/dashboard' } as RouterStateSnapshot;

    const result = await runGuard({} as ActivatedRouteSnapshot, state);

    expect(keycloakSpy.login).toHaveBeenCalledTimes(1);
    expect(keycloakSpy.login).toHaveBeenCalledWith({
      redirectUri: window.location.origin + '/dashboard',
    });
    expect(result).toBe(false);
  });

  it('debe construir el redirectUri con la url del estado actual', async () => {
    (keycloakSpy as any).authenticated = false;
    const state = { url: '/partners/123/detail' } as RouterStateSnapshot;

    await runGuard({} as ActivatedRouteSnapshot, state);

    expect(keycloakSpy.login).toHaveBeenCalledWith({
      redirectUri: window.location.origin + '/partners/123/detail',
    });
  });
});
