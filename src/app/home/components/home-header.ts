import { Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { ConfigurationService } from 'src/app/services/configuration.service';

@Component({
  selector: 'home-header',
  styles: [
    `
      .home-header {
        text-align: center;
        height: 6.4375rem;
        background-color: var(--color-neutral-surface);
        color: var(--text-color-primary);
        border-bottom: 1px solid var(--color-neutral-divider);
        display: flex;
        justify-content: end;
        align-items: end;
        padding: 1rem;
      }

      .btn-logout {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        color: var(--text-color-secondary);
        border: none;
        cursor: pointer;
        margin-right: 4rem;
        display: flex;
        align-items: center;
        font-size: 1rem;
        transition: background-color 0.3s ease;
      }

      .btn-logout span {
        margin-right: 0.5rem;
      }

      .btn-logout:hover {
        background-color: var(--color-neutral-surface);
      }
    `,
  ],
  template: `
    <header class="home-header">
      <button class="btn-logout" (click)="logout()">
        <span>Cerrar Sesión</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
        >
          <path
            d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm..."
          />
        </svg>
      </button>
    </header>
  `,
})
export class HomeHeaderComponent {
  private keycloak = inject(Keycloak);
  private configurationService = inject(ConfigurationService);

  async logout(): Promise<void> {
    const uri = `${window.location.origin}/${this.configurationService.partnerId()}`;
    await this.keycloak.logout({ redirectUri: uri });
  }
}
