import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { HomeFooterComponent } from './home-footer';

describe('HomeFooterComponent', () => {
  let fixture: ComponentFixture<HomeFooterComponent>;
  let component: HomeFooterComponent;
  let configurationServiceMock: { currentConfig: jasmine.Spy };

  const buildComponent = async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFooterComponent],
    })
      .overrideComponent(HomeFooterComponent, {
        set: {
          providers: [
            { provide: ConfigurationService, useValue: configurationServiceMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeFooterComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    configurationServiceMock = {
      currentConfig: jasmine.createSpy('currentConfig').and.returnValue({
        assets: {
          logoFooter: 'logo-footer.png',
          logoCardif: 'logo-cardif.png',
        },
      }),
    };
  });

  it('should create the component', async () => {
    await buildComponent();
    expect(component).toBeTruthy();
  });

  it('should expose the footer logos through computed signals', async () => {
    await buildComponent();
    expect(component.urlLogoLeft()).toBe('logo-footer.png');
    expect(component.urlLogoRight()).toBe('logo-cardif.png');
  });

  it('should bind the logos to the img src attributes', async () => {
    await buildComponent();
    fixture.detectChanges();

    const images = (fixture.nativeElement as HTMLElement).querySelectorAll('img');
    expect(images.length).toBe(2);
    expect(images[0].getAttribute('src')).toBe('logo-footer.png');
    expect(images[1].getAttribute('src')).toBe('logo-cardif.png');
  });

  it('should return undefined when there is no current config', async () => {
    configurationServiceMock.currentConfig.and.returnValue(undefined);
    await buildComponent();

    expect(component.urlLogoLeft()).toBeUndefined();
    expect(component.urlLogoRight()).toBeUndefined();
  });
});
