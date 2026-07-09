import { Routes } from '@angular/router';

import { partnerSessionGuard } from './guards/partner-session-guard';

export const ADVISOR_CARDS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [partnerSessionGuard],
    loadComponent: () => import('./pages/cards/cards').then((m) => m.Cards),
  },
];
