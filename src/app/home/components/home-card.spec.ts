import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PARTNER_ID_MAP } from 'src/app/config/partnerIdMap';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { RedirectService } from 'src/app/services/redirect.service';
import { environment } from 'src/environments/environment';
import { HomeCardComponent } from './home-card';

describe('HomeCardComponent', () => {
  let fixture: ComponentFixture<HomeCardComponent>;
  let component: HomeCardComponent;

  let httpClientMock: { post: jasmine.Spy };
  let configurationServiceMock: {
    correlationId: jasmine.Spy;
    partnerId: jasmine.Spy;
    SetProductType: jasmine.Spy;
  };
  let redirectServiceMock: { redirectTo: jasmine.Spy };

  beforeEach(async () => {
    httpClientMock = {
      post: jasmine.createSpy('post').and.returnValue(of({})),
    };
    configurationServiceMock = {
      correlationId: jasmine.createSpy('correlationId').and.returnValue('corr-123'),
      partnerId: jasmine.createSpy('partnerId').and.returnValue('partner-key'),
      SetProductType: jasmine.createSpy('SetProductType'),
    };
    redirectServiceMock = {
      redirectTo: jasmine.createSpy('redirectTo'),
    };

    await TestBed.configureTestingModule({
      imports: [HomeCardComponent],
    })
      .overrideComponent(HomeCardComponent, {
        set: {
          providers: [
            { provide: HttpClient, useValue: httpClientMock },
            { provide: ConfigurationService, useValue: configurationServiceMock },
            { provide: RedirectService, useValue: redirectServiceMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the badge, title and button labels from inputs', () => {
    fixture.componentRef.setInput('title', 'Mi título');
    fixture.componentRef.setInput('labelButton', 'Continuar');
    fixture.componentRef.setInput('labelBadge', 'Nuevo');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.title')?.textContent).toContain('Mi título');
    expect(el.querySelector('.button')?.textContent).toContain('Continuar');
    expect(el.querySelector('.badge')?.textContent).toContain('Nuevo');
  });

  describe('onClick', () => {
    it('should POST to the persistente API with correlationId and partnerId', () => {
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector(
        '.button',
      ) as HTMLButtonElement;
      button.click();

      expect(httpClientMock.post).toHaveBeenCalledTimes(1);
      const [url, body] = httpClientMock.post.calls.mostRecent().args;
      expect(url).toBe(environment.urls.persistenteApi);
      expect(body.correlationId).toBe('corr-123');
      expect(body.partnerId).toBe(PARTNER_ID_MAP['partner-key']);
    });

    it('should use an empty string when partnerId is null', () => {
      configurationServiceMock.partnerId.and.returnValue(null);
      fixture.detectChanges();

      component.onClick();

      const [, body] = httpClientMock.post.calls.mostRecent().args;
      expect(body.partnerId).toBe(PARTNER_ID_MAP['']);
    });

    it('should set the product type from the input', () => {
      fixture.componentRef.setInput('productType', 7);
      fixture.detectChanges();

      component.onClick();

      expect(configurationServiceMock.SetProductType).toHaveBeenCalledWith(7);
    });

    it('should default the product type to 0 when undefined', () => {
      fixture.detectChanges();

      component.onClick();

      expect(configurationServiceMock.SetProductType).toHaveBeenCalledWith(0);
    });

    it('should redirect to the configured target with the /home origin', () => {
      fixture.componentRef.setInput('redirecTo', '/credit');
      fixture.detectChanges();

      component.onClick();

      expect(redirectServiceMock.redirectTo).toHaveBeenCalledWith('/credit', '/home');
    });
  });
});
