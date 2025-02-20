import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login-page/login-page.component')
        .then(m => m.LoginPageComponent)
    },
    {
        path: 'homePage/search',
        loadComponent: () => import('./components/home-page/search/search.component')
        .then(m => m.SearchComponent)
    }
];
