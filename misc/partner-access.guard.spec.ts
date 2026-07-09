import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import Keycloak from 'keycloak-js';

import { partnerAccessGuard } from './partner-access.guard';
import { PARTNER_ID_MAP } from '../config/partnerIdMap';

describe('partnerAccessGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let keycloakSpy: jasmine.SpyObj<Keycloak>;
  const NOT_FOUND_TREE = {} as UrlTree;

  // Elegimos una clave que exista en el mapa real para no acoplar el test
  // a un valor concreto.
  const knownSlug = Object.keys(PARTNER_ID_MAP)[0];
  const mappedId = PARTNER_ID_MAP[knownSlug];

  const buildRoute = (partnerId: string | null): ActivatedRouteSnapshot =>
    ({
      paramMap: {
        get: (key: string) => (key === 'partnerId' ? partnerId : null),
      },
    }) as unknown as ActivatedRouteSnapshot;

  const runGuard = (route: ActivatedRouteSnapshot) =>
    TestBed.runInInjectionContext(() =>
      (partnerAccessGuard as CanActivateFn)(
        route,
        {} as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(NOT_FOUND_TREE);

    keycloakSpy = jasmine.createSpyObj<Keycloak>('Keycloak', [], {
      tokenParsed: undefined,
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Keycloak, useValue: keycloakSpy },
      ],
    });
  });

  it('debe permitir el acceso cuando el partner_id del token incluye el id de la ruta', () => {
    (keycloakSpy as any).tokenParsed = { partner_id: [mappedId] };

    const result = runGuard(buildRoute(knownSlug));

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('debe redirigir a /not-found cuando el partner_id del token NO incluye el id de la ruta', () => {
    (keycloakSpy as any).tokenParsed = { partner_id: ['otro-id'] };

    const result = runGuard(buildRoute(knownSlug));

    expect(routerSpy.createUrlTree).toHaveBeenCalledOnceWith(['/not-found']);
    expect(result).toBe(NOT_FOUND_TREE);
  });

  it('debe redirigir a /not-found cuando el token no tiene partner_id', () => {
    (keycloakSpy as any).tokenParsed = {};

    const result = runGuard(buildRoute(knownSlug));

    expect(routerSpy.createUrlTree).toHaveBeenCalledOnceWith(['/not-found']);
    expect(result).toBe(NOT_FOUND_TREE);
  });

  it('debe redirigir a /not-found cuando tokenParsed es undefined', () => {
    (keycloakSpy as any).tokenParsed = undefined;

    const result = runGuard(buildRoute(knownSlug));

    expect(routerSpy.createUrlTree).toHaveBeenCalledOnceWith(['/not-found']);
    expect(result).toBe(NOT_FOUND_TREE);
  });

  it('debe redirigir a /not-found cuando la ruta no trae partnerId (usa "" -> undefined en el mapa)', () => {
    (keycloakSpy as any).tokenParsed = { partner_id: [mappedId] };

    const result = runGuard(buildRoute(null));

    expect(routerSpy.createUrlTree).toHaveBeenCalledOnceWith(['/not-found']);
    expect(result).toBe(NOT_FOUND_TREE);
  });
});
