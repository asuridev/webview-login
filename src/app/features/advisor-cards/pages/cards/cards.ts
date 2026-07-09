import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { environment } from '../../../../../environments/environment';
import { OidcClient } from '../../../../core/auth/oidc-client';
import { SessionStore } from '../../../../core/auth/session.store';
import { ThemeQueries } from '../../queries/theme-queries';
import { NEUTRAL_THEME } from '../../models/public-theme-model';
import { resolveAssetUrl } from '../../models/asset-url';
import { CARDS } from './card-model';
import { SiteFooter } from './site-footer';

@Component({
  selector: 'app-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteFooter],
  template: `
    <div
      class="flex min-h-screen flex-col"
      [style.background-color]="theme().tokens.colorSurface"
      [style.color]="theme().tokens.colorTextStrong"
      [style.font-family]="fontFamily()"
    >
      <header class="flex items-center justify-between px-4 py-4 sm:px-8">
        @if (partnerLogoUrl()) {
          <img [src]="partnerLogoUrl()" [alt]="theme().displayName" class="h-8 w-auto object-contain" />
        } @else {
          <span></span>
        }
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:[background-color:var(--logout-hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
          [style.border-color]="logoutBorder()"
          [style.color]="theme().tokens.colorTextStrong"
          [style.outline-color]="theme().tokens.colorPrimary"
          [style.--logout-hover-bg]="theme().tokens.colorSecondaryTint"
          aria-label="Cerrar sesión"
          (click)="logout()"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span class="hidden sm:inline">Cerrar sesión</span>
        </button>
      </header>

      <main class="flex flex-1 flex-col items-center justify-center gap-7 px-4 py-10 sm:px-8">
        <h1 class="text-center text-2xl font-semibold sm:text-3xl">¿Qué quieres hacer hoy?</h1>

        <div class="grid w-full max-w-[1287px] grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (card of cards; track card.id) {
            <div
              class="group mx-auto flex min-h-[326px] w-full max-w-[388px] flex-col justify-between rounded-xl border p-5 transition-colors hover:[border-color:var(--brand-primary)]"
              [style.background-color]="cardSurface()"
              [style.border-color]="cardBorder()"
              [style.--brand-primary]="theme().tokens.colorPrimary"
            >
              <div class="flex flex-col gap-8">
                <span
                  class="inline-flex w-fit rounded-lg border px-3 py-1 text-sm font-medium"
                  [style.background-color]="theme().tokens.colorPrimaryTint"
                  [style.border-color]="tagBorder()"
                  [style.color]="theme().tokens.colorTextStrong"
                >
                  {{ card.tag }}
                </span>
                <h2 class="text-2xl font-semibold leading-8" [style.color]="theme().tokens.colorTextStrong">
                  {{ card.title }}
                </h2>
              </div>

              <button
                type="button"
                class="mt-6 inline-flex w-fit cursor-pointer rounded-full px-5 py-3 text-base font-semibold text-white transition-colors hover:[background-color:var(--cta-hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
                [style.background-color]="ctaBg()"
                [style.outline-color]="theme().tokens.colorPrimary"
                [style.--cta-hover-bg]="ctaBgHover()"
                (click)="selectCard()"
              >
                {{ card.ctaLabel }}
              </button>
            </div>
          }
        </div>
      </main>

      <app-site-footer [theme]="theme()" />
    </div>
  `,
})
export class Cards {
  private sessionStore = inject(SessionStore);
  private themeQueries = inject(ThemeQueries);
  private oidcClient = inject(OidcClient);

  protected readonly cards = CARDS;

  private readonly partnerSlug = computed(() => this.sessionStore.claims()?.partnerSlug ?? '');

  private readonly themeQuery = injectQuery(() => this.themeQueries.bySlug(this.partnerSlug()));

  protected readonly theme = computed(() => this.themeQuery.data() ?? NEUTRAL_THEME);

  /**
   * Colores derivados de la marca del partner (tokens de `GET /api/theme/:slug`) para
   * las cards y el logout, manteniendo la estética limpia del Figma (marca por acentos).
   * Los tonos medios (`colorPrimary`) solo se usan como relleno/borde; el texto legible
   * va en `colorTextStrong`. El CTA sólido oscurece `colorPrimary` con `color-mix` para
   * garantizar contraste ≥4.5:1 con el texto blanco en cualquier marca (verde/azul/neutro).
   */
  private readonly primary = computed(() => this.theme().tokens.colorPrimary);
  /** Superficie de card: tinte de marca casi imperceptible sobre `colorSurface`. */
  protected readonly cardSurface = computed(
    () => `color-mix(in srgb, ${this.primary()} 5%, ${this.theme().tokens.colorSurface})`,
  );
  /** Borde de card: `colorBorder` con un toque de marca (más marcado en hover, ver plantilla). */
  protected readonly cardBorder = computed(
    () => `color-mix(in srgb, ${this.primary()} 15%, ${this.theme().tokens.colorBorder})`,
  );
  /** Borde del pill/tag: acento de marca translúcido sobre el `colorPrimaryTint`. */
  protected readonly tagBorder = computed(() => `color-mix(in srgb, ${this.primary()} 30%, transparent)`);
  /** Fondo del CTA "Ver ahora": marca oscurecida para pasar 4.5:1 con texto blanco. */
  protected readonly ctaBg = computed(() => `color-mix(in srgb, ${this.primary()} 80%, black)`);
  /** Fondo del CTA en hover: un paso más oscuro (feedback de estado). */
  protected readonly ctaBgHover = computed(() => `color-mix(in srgb, ${this.primary()} 68%, black)`);
  /** Borde del botón de cerrar sesión: neutro con un acento leve de marca (acción subordinada). */
  protected readonly logoutBorder = computed(
    () => `color-mix(in srgb, ${this.primary()} 25%, ${this.theme().tokens.colorBorder})`,
  );

  protected readonly fontFamily = computed(() => `${this.theme().typography.fontFamily}, sans-serif`);

  /** Logo primario del partner para la esquina superior izquierda (de la respuesta del theme). */
  protected readonly partnerLogoUrl = computed(() => resolveAssetUrl(this.theme().assets.logoUrl));

  /** Cualquier card, en esta iteración, redirige al mismo destino: el shell `/:partnerSlug` del asesor en transversal (spec FR-005, Assumptions; gap CLAUDE.md §9). */
  selectCard(): void {
    window.location.href = `${environment.transversalBaseUrl}/api/auth/login?returnTo=/${this.partnerSlug()}`;
  }

  /** Logout RP-initiated del reino: descarta la sesión en memoria y redirige al `end_session` del IdP, que devuelve a webview-login (CLAUDE.md §5). */
  logout(): void {
    // Capturar el id_token ANTES de resetear (reset() lo limpia): es el
    // id_token_hint que Keycloak < 19 exige para redirigir tras el logout.
    const idTokenHint = this.sessionStore.idToken() ?? undefined;
    this.sessionStore.reset();
    window.location.href = this.oidcClient.buildEndSessionUrl(idTokenHint);
  }
}
