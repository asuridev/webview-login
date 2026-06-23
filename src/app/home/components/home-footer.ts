import { Component, computed, inject } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration.service';

@Component({
  selector: 'home-footer',
  styles: [
    `
      .home-footer {
        text-align: center;
        padding-right: 2rem;
        padding-left: 2rem;
        height: 4rem;
        border: 1px solid var(--color-neutral-divider);
        background-color: var(--color-neutral-surface);
        color: var(--text-color-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      img {
        max-height: 44px;
        width: auto;
      }

      .logo-right {
        display: none;
      }

      @media (min-width: 650px) {
        .logo-right {
          display: block;
        }
      }
    `,
  ],
  template: `
    <footer class="home-footer">
      <div>
        <img [src]="urlLogoLeft()" />
      </div>
      <div class="logo-right">
        <img [src]="urlLogoRight()" />
      </div>
    </footer>
  `,
})
export class HomeFooterComponent {
  private configurationService = inject(ConfigurationService);

  urlLogoLeft = computed(
    () => this.configurationService.currentConfig()?.assets.logoFooter,
  );
  urlLogoRight = computed(
    () => this.configurationService.currentConfig()?.assets.logoCardif,
  );
}
