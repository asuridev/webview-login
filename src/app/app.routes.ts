import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'cards',
    loadChildren: () => import('./features/advisor-cards/advisor-cards.routes').then((m) => m.ADVISOR_CARDS_ROUTES),
  },
];
