import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { environment } from 'src/environments/environment';
import HomePage from './home.page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let component: HomePage;
  let configurationServiceMock: {
    currentText: jasmine.Spy;
    SetCorrelationId: jasmine.Spy;
  };
  let keycloakMock: { tokenParsed: unknown };

  const clientId = environment.keycloak.clientId;

  const buildConfig = (cards: unknown[]) => ({
    body: {
      title: 'Bienvenido',
      cards,
    },
  });

  const buildToken = (roles: string[]) => ({
    resource_access: {
      [clientId]: { roles },
    },
  });

  const buildComponent = async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(HomePage, {
        set: {
          imports: [],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: ConfigurationService, useValue: configurationServiceMock },
            { provide: Keycloak, useValue: keycloakMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    configurationServiceMock = {
      currentText: jasmine.createSpy('currentText').and.returnValue(buildConfig([])),
      SetCorrelationId: jasmine.createSpy('SetCorrelationId'),
    };
    keycloakMock = { tokenParsed: buildToken([]) };
  });

  it('should create the page', async () => {
    await buildComponent();
    expect(component).toBeTruthy();
  });

  it('should expose the body title through the titleBody computed', async () => {
    await buildComponent();
    expect(component.titleBody()).toBe('Bienvenido');
  });

  it('should keep cards that have no permission requirement', async () => {
    configurationServiceMock.currentText.and.returnValue(
      buildConfig([{ title: 'Libre' }]),
    );
    await buildComponent();

    expect(component.cards()?.length).toBe(1);
    expect(component.cards()?.[0]).toEqual({ title: 'Libre' });
  });

  it('should include a card whose permission the user has', async () => {
    configurationServiceMock.currentText.and.returnValue(
      buildConfig([{ title: 'Restringida', permission: 'view_card' }]),
    );
    keycloakMock.tokenParsed = buildToken(['view_card']);
    await buildComponent();

    expect(component.cards()?.length).toBe(1);
  });

  it('should exclude a card whose permission the user lacks', async () => {
    configurationServiceMock.currentText.and.returnValue(
      buildConfig([{ title: 'Restringida', permission: 'view_card' }]),
    );
    keycloakMock.tokenParsed = buildToken(['other_role']);
    await buildComponent();

    expect(component.cards()?.length).toBe(0);
  });

  it('should set a generated correlation id on init', async () => {
    const uuid = '11111111-1111-4111-8111-111111111111';
    spyOn(crypto, 'randomUUID').and.returnValue(uuid);
    await buildComponent();

    component.ngOnInit();

    expect(configurationServiceMock.SetCorrelationId).toHaveBeenCalledWith(uuid);
  });
});
