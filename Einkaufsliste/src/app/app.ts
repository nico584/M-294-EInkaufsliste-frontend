import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RoutesRecognized } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';

import { AppLogin } from './components/app-login/app-login';
import { IsInRolesDirective } from './directives/app-is-in-roles.dir';
import { AppRoles } from './app.roles';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [MatToolbar, MatButton, MatIcon, MatMenuModule, RouterLink, RouterOutlet, AppLogin, IsInRolesDirective],
})
export class App {
  public pagetitle = '';

  public get roles() {
    return AppRoles;
  }

  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof RoutesRecognized) {
        this.pagetitle = '';
        const route = e.state.root.firstChild;
        if (route) {
          this.pagetitle = route.data['pagetitle'] || '';
        }
      }
    });
  }
}
