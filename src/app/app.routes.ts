import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [MsalGuard]
  },
  {
    path: 'anagrafica',
    loadChildren: () => import('./pages/anagrafica/anagrafica.routes'),
    canActivate: [MsalGuard]
  },
  {
    path: 'user-profile',
    loadChildren: () => import('./pages/user-profile/user-profile.routes'),
    canActivate: [MsalGuard]
  },
  {
    path: 'administrative',
    loadChildren: () => import('./pages/administrative/administrative.routes'),
    canActivate: [MsalGuard]
  },
  { path: '**', component: HomeComponent }
];
