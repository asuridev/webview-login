import { HttpClient } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { PARTNER_ID_MAP } from 'src/app/config/partnerIdMap';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { RedirectService } from 'src/app/services/redirect.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'home-card',
  styles: [
`
   .card {
      height: 326px;
      max-width: 364px;
      margin-right: 0.75rem;
      border-radius: 0.75rem;
      padding: 1.25rem;
      font-weight: 600;
      background-color: var(--color-neutral-surface);
      border: 1px solid var(--color-neutral-border);
      color: var(--text-color-primary);
      font-size: var(--font-size-xxl);
      display: flex;
      flex-direction: column;
      align-items: start;
    }

    .content {
      width: 50%;
      flex: 1;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      margin: 0;
      font-weight: 400;
      background-color: var(--color-neutral-light);
      border: 1px solid var(--color-neutral-border);
      color: var(--color-neutral-medium);
      font-size: var(--font-size-sm);
    }

    .title {
      margin-top: 2rem;
      margin-bottom: 2.75rem;
    }

    .button {
      padding: 0.75rem 1rem;
      border-radius: 2rem;
      text-decoration: none;
      background-color: transparent;
      border: 1px solid var(--color-primary-main);
      color: var(--color-primary-main);
      font-size: var(--font-size-base);
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: var(--color-primary-light);
      border: 1px solid var(--color-primary-dark);
      color: var(--color-primary-dark);
      font-size: var(--font-size-base);
    }
    `
  ],
  template: `
    <div [class]="['card']">
      <div class="content">
        <span [class]="['badge']">{{ labelBadge() }}</span>
        <p class="title">{{ title() }}</p>
      </div>
      <button (click)="onClick()" [class]="['button']">
        {{ labelButton() }}
      </button>
    </div>
  `,
})
export class HomeCardComponent {
  private httpClient = inject(HttpClient);
  private configurationService = inject(ConfigurationService);
  private redirectService = inject(RedirectService);

  public title = input<string>('');
  public labelButton = input<string>('');
  public labelBadge = input<string>('');
  public redirecTo = input<string>('');
  public productType = input<number | undefined>(undefined);

  onClick(): void {
    this.httpClient
      .post(environment.urls.persistenteApi, {
        correlationId: this.configurationService.correlationId(),
        partnerId: PARTNER_ID_MAP[this.configurationService.partnerId() ?? ""],
        saleInformation:
          '{"personalInformation":{"documentType":"CC","documentNumber":270000190,"surname":"Barraza","seco...
      })
      .subscribe();
    this.configurationService.SetProductType(this.productType() ?? 0);
    this.redirectService.redirectTo(this.redirecTo(), '/home');
  }
}
