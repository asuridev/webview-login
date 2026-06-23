import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RedirectService {
  redirectTo(to: string, origin: string): void {
    window.location.href = `${to}?origin=${encodeURIComponent(origin)}`;
  }
}
