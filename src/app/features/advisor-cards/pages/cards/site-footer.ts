import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { PublicTheme } from '../../models/public-theme-model';
import { resolveAssetUrl } from '../../models/asset-url';

/**
 * Footer co-branded del diseño Figma (node 12286-272307): a la izquierda el sello
 * "Vigilado" (Superintendencia Financiera) + divisor + logos co-brand (banco y
 * grupo); a la derecha la aseguradora del programa. Todo se deriva de `theme`
 * (assets/legal) — los `<img>` se ocultan si la URL viene vacía (fallback neutro,
 * no bloquea el acceso, CLAUDE.md §4/§6).
 */
@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="flex w-full flex-wrap items-center justify-between gap-4 border-t px-6 py-4 sm:px-12"
      [style.background-color]="theme().tokens.colorSurface"
      [style.border-color]="theme().tokens.colorBorder"
    >
      <div class="flex flex-wrap items-center gap-4">
        @if (sealUrl()) {
          <img [src]="sealUrl()" [alt]="theme().legal.footerDisclaimer" class="h-5 w-auto max-w-full object-contain" />
        } @else {
          <p class="max-w-xs text-xs leading-tight" [style.color]="theme().tokens.colorTextMuted">
            {{ theme().legal.footerDisclaimer }}
          </p>
        }

        @if (bankLogoUrl() || groupLogoUrl()) {
          <div class="h-10 w-px shrink-0" [style.background-color]="theme().tokens.colorBorder"></div>
        }

        @if (bankLogoUrl()) {
          <img [src]="bankLogoUrl()" alt="Logo del banco" class="h-8 w-auto max-w-full object-contain" />
        }
        @if (groupLogoUrl()) {
          <img [src]="groupLogoUrl()" alt="Logo del grupo" class="h-8 w-auto max-w-full object-contain" />
        }
      </div>

      @if (insurerLogoUrl()) {
        <img [src]="insurerLogoUrl()" alt="Logo de la aseguradora" class="h-6 w-auto max-w-full object-contain" />
      }
    </footer>
  `,
})
export class SiteFooter {
  readonly theme = input.required<PublicTheme>();

  protected readonly sealUrl = computed(() => resolveAssetUrl(this.theme().assets.footerSealUrl));
  protected readonly bankLogoUrl = computed(() => resolveAssetUrl(this.theme().assets.coBrandBankLogoUrl));
  protected readonly groupLogoUrl = computed(() => resolveAssetUrl(this.theme().assets.coBrandGroupLogoUrl));
  protected readonly insurerLogoUrl = computed(() => resolveAssetUrl(this.theme().assets.footerInsurerUrl));
}
