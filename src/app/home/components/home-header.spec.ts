import { ComponentFixture, TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { HomeHeaderComponent } from './home-header';

describe('HomeHeaderComponent', () => {
  let fixture: ComponentFixture<HomeHeaderComponent>;
  let component: HomeHeaderComponent;
  let keycloakMock: { logout: jasmine.Spy };
  let configurationServiceMock: { partnerId: jasmine.Spy };

  beforeEach(async () => {
    keycloakMock = {
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
    };
    configurationServiceMock = {
      partnerId: jasmine.createSpy('partnerId').and.returnValue('bnp-partner'),
    };

    await TestBed.configureTestingModule({
      imports: [HomeHeaderComponent],
    })
      .overrideComponent(HomeHeaderComponent, {
        set: {
          providers: [
            { provide: Keycloak, useValue: keycloakMock },
            { provide: ConfigurationService, useValue: configurationServiceMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should logout with the partner-specific redirect uri', async () => {
    const expectedUri = `${window.location.origin}/bnp-partner`;

    await component.logout();

    expect(keycloakMock.logout).toHaveBeenCalledWith({ redirectUri: expectedUri });
  });

  it('should logout when the close-session button is clicked', () => {
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.btn-logout',
    ) as HTMLButtonElement;

    button.click();

    expect(keycloakMock.logout).toHaveBeenCalledTimes(1);
  });
});
