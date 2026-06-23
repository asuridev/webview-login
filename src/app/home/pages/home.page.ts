import { Component, computed, inject } from '@angular/core';
import { HomeHeaderComponent } from '../components/home-header';
import { HomeFooterComponent } from '../components/home-footer';
import { HomeCardComponent } from '../components/home-card';
import { ConfigurationService } from 'src/app/services/configuration.service';
import Keycloak from 'keycloak-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  imports: [HomeHeaderComponent, HomeFooterComponent, HomeCardComponent],
  styles: [
    `
      .page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }
      .content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: var(--color-neutral-sky);
        font-family: var(--font-famify);
      }
      .title {
        text-align: center;
        font-size: var(--font-size-xxxl);
        color: var(--text-color-primary);
        margin-bottom: 1.75rem;
      }
      .cards {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 0 auto;
      }

      @media (min-width: 768px) {
        .cards {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1200px) {
        .cards {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
  template: `
    <div class="page">
      <home-header />
      <main class="content">
        <h1 class="title">{{ titleBody() }}</h1>
        <div class="cards">
          @for (card of cards(); track $index) {
            <home-card
              title="{{ card?.title }}"
              labelButton="{{ card?.cardButton?.label }}"
              labelBadge="{{ card?.cardBadge?.label }}"
              redirecTo="{{ card?.cardButton?.redirecTo }}"
              [productType]="card?.cardButton?.productType"
            />
          }
        </div>
      </main>
      <home-footer />
    </div>
  `,
})
export default class HomePage {
  private configurationService = inject(ConfigurationService);
  private keycloak = inject(Keycloak);

  titleBody = computed(
    () => this.configurationService.currentText()?.body.title,
  );

  private userPermissions = computed<string[]>(() => {
    const permissions =
      this.keycloak?.tokenParsed?.['resource_access']?.[
        environment.keycloak.clientId
      ].roles;
    return Array.isArray(permissions) ? permissions : [];
  });

  cards = computed(() =>
    this.configurationService
      .currentText()
      ?.body.cards.filter(
        (card) =>
          !card.permission || this.userPermissions().includes(card?.permission),
      ),
  );

  ngOnInit(): void {
    console.log(this.keycloak.tokenParsed);
    const correlationId = crypto.randomUUID();
    console.log('correlationId:', correlationId);
    this.configurationService.SetCorrelationId(correlationId);
    console.log('-----------------------------------');
  }
}
