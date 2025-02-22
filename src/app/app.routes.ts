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
        .then(m => m.LoginPageComponent),
        data: {isLogin: true}
    },
    {
        path: 'signUp',
        loadComponent: () => import('./components/login-page/login-page.component')
        .then(m => m.LoginPageComponent),
        data: {isLogin: false}
    },
    {
        path: 'homePage/search',
        loadComponent: () => import('./components/home-page/search/search.component')
        .then(m => m.SearchComponent)
    },
    { 
        path: '**', 
        redirectTo: '/login'
    }
];
