import { Routes } from '@angular/router';

export const LOGIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/login-redirect/login-redirect').then((m) => m.LoginRedirect) },
  { path: 'callback', loadComponent: () => import('./pages/callback/callback').then((m) => m.Callback) },
  { path: 'access-denied', loadComponent: () => import('./pages/access-denied/access-denied').then((m) => m.AccessDenied) },
];
