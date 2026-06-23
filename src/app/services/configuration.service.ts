import { Injectable, signal } from '@angular/core';

export interface CardButton {
  label: string;
  redirecTo: string;
  productType: number;
}

export interface CardBadge {
  label: string;
}

export interface CardText {
  title: string;
  text: string;
  permission?: string;
  cardButton: CardButton;
  cardBadge: CardBadge;
}

export interface AppText {
  body: {
    title: string;
    cards: CardText[];
  };
}

export interface AppConfig {
  assets: {
    logoFooter: string;
    logoCardif: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private readonly _correlationId = signal<string>('');
  private readonly _partnerId = signal<string | null>(null);
  private readonly _productType = signal<number>(0);
  private readonly _currentText = signal<AppText | undefined>(undefined);
  private readonly _currentConfig = signal<AppConfig | undefined>(undefined);

  readonly correlationId = this._correlationId.asReadonly();
  readonly partnerId = this._partnerId.asReadonly();
  readonly productType = this._productType.asReadonly();
  readonly currentText = this._currentText.asReadonly();
  readonly currentConfig = this._currentConfig.asReadonly();

  SetProductType(productType: number): void {
    this._productType.set(productType);
  }

  SetCorrelationId(correlationId: string): void {
    this._correlationId.set(correlationId);
  }

  SetPartnerId(partnerId: string | null): void {
    this._partnerId.set(partnerId);
  }
}
