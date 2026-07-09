import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { partnerGuard } from './partner.guard';
import { BANKS_CONFIG } from '../config/partners/configurations/banks.config';

describe('partnerGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  const NOT_FOUND_TREE = {} as UrlTree;

  // Tomamos una clave existente en BANKS_CONFIG para no acoplar el test
  // a un banco concreto.
  const knownPartnerId = Object.keys(BANKS_CONFIG)[0];

  const buildRoute = (partnerId: string | null): ActivatedRouteSnapshot =>
    ({
      paramMap: {
        get: (key: string) => (key === 'partnerId' ? partnerId : null),
      },
    }) as unknown as ActivatedRouteSnapshot;

  const runGuard = (route: ActivatedRouteSnapshot) =>
    TestBed.runInInjectionContext(() =>
      (partnerGuard as CanActivateFn)(route, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(NOT_FOUND_TREE);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  it('debe permitir el acceso cuando el partnerId existe en BANKS_CONFIG', () => {
    const result = runGuard(buildRoute(knownPartnerId));

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('debe redirigir a /not-found cuando el partnerId NO existe en BANKS_CONFIG', () => {
    const result = runGuard(buildRoute('partner-inexistente'));

    expect(routerSpy.createUrlTree).toHaveBeenCalledOnceWith(['/not-found']);
    expect(result).toBe(NOT_FOUND_TREE);
  });

  it('debe redirigir a /not-found cuando la ruta no trae partnerId', () => {
    const result = runGuard(buildRoute(null));

    expect(routerSpy.createUrlTree).toHaveBeenCalledOnceWith(['/not-found']);
    expect(result).toBe(NOT_FOUND_TREE);
  });
});
