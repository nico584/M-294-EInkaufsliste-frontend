import { Routes } from '@angular/router';
import { appCanActivate } from './guard/app.auth.guard';
import { AppRoles } from './app.roles';
import { NoAccess } from './pages/no-access/no-access';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'shoppinglists',
  },
  {
    path: 'shoppinglists',
    loadComponent: () =>
      import('./pages/shopping-list-list/shopping-list-list').then(c => c.ShoppingListList),
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Einkaufslisten',
    },
  },
  {
    path: 'shoppinglists/:id',
    loadComponent: () =>
      import('./pages/shopping-list-detail/shopping-list-detail').then(c => c.ShoppingListDetail),
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Einkaufsliste',
    },
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/category-list/category-list').then(c => c.CategoryList),
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Admin],
      pagetitle: 'Kategorien',
    },
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/user-list/user-list').then(c => c.UserList),
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Admin],
      pagetitle: 'Benutzerverwaltung',
    },
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/user-profile/user-profile').then(c => c.UserProfile),
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Mein Profil',
    },
  },
  {
    path: 'noaccess',
    component: NoAccess,
  },
];
