import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { catchError, firstValueFrom, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NEUTRAL_THEME, type PublicTheme } from '../models/public-theme-model';

/** Único fetch de servidor de este proyecto (research.md R1) — envuelto directo en `queryFn` sin `<Feature>ApiService` intermedio, siguiendo la estructura acotada de plan.md (sin `services/` para este feature de una sola query). */
@Injectable({ providedIn: 'root' })
export class ThemeQueries {
  private http = inject(HttpClient);

  bySlug(slug: string) {
    return queryOptions({
      queryKey: ['theme', slug] as const,
      queryFn: () =>
        firstValueFrom(
          this.http
            .get<PublicTheme>(`${environment.transversalBaseUrl}/api/theme/${slug}`)
            .pipe(catchError(() => of(NEUTRAL_THEME))),
        ),
    });
  }
}
