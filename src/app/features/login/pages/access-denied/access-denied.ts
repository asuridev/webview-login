import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 class="text-xl font-semibold">No tienes acceso</h1>
      <p class="text-sm text-gray-600">
        Tu usuario no tiene un partner activo asociado, o falló el inicio de sesión. Intenta nuevamente.
      </p>
      <a routerLink="/" class="text-sm font-medium text-blue-600 underline">Volver a intentar</a>
    </div>
  `,
})
export class AccessDenied {}
