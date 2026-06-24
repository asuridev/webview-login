import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export enum DeviceType {
  Phone = 1,
  Desktop = 2,
  Tablet = 3,
  Other = 4,
}

export interface DeviceInfo {
  deviceType: DeviceType;
  ip: string;
}

@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
  private readonly httpClient = inject(HttpClient);
  private readonly ipApiUrl = 'https://api.ipify.org?format=json';

  /** Detecta el tipo de dispositivo a partir del user agent (sin librerías). */
  getDeviceType(): DeviceType {
    const ua = (navigator.userAgent || '').toLowerCase();

    // Tablet primero: iPad, o Android sin "mobile"
    const isTablet =
      /ipad/.test(ua) ||
      (/android/.test(ua) && !/mobile/.test(ua)) ||
      // iPadOS 13+ se reporta como Mac con pantalla táctil
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isPhone =
      /iphone|ipod|windows phone/.test(ua) ||
      (/android/.test(ua) && /mobile/.test(ua)) ||
      /blackberry|bb10|opera mini|iemobile/.test(ua);

    const isDesktop = /windows nt|macintosh|mac os x|linux|cros/.test(ua);

    if (isTablet) return DeviceType.Tablet;
    if (isPhone) return DeviceType.Phone;
    if (isDesktop) return DeviceType.Desktop;
    return DeviceType.Other;
  }

  /** Obtiene la IP pública vía API externa; devuelve '' si falla. */
  getIp(): Observable<string> {
    return this.httpClient.get<{ ip: string }>(this.ipApiUrl).pipe(
      map((res) => res.ip),
      catchError(() => of('')),
    );
  }

  /** Devuelve tipo de dispositivo + IP en una sola llamada. */
  getDeviceInfo(): Observable<DeviceInfo> {
    return this.getIp().pipe(
      map((ip) => ({ deviceType: this.getDeviceType(), ip })),
    );
  }
}
