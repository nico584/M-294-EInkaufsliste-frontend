import { Component, inject, OnInit } from '@angular/core';
import { AppAuthService } from '../../service/app.auth.service';

@Component({
  selector: 'app-app-login',
  imports: [],
  templateUrl: './app-login.html',
  styleUrl: './app-login.css',
})
export class AppLogin implements OnInit {
  private authService = inject(AppAuthService);

  public username = '';
  public useralias = '';

  ngOnInit(): void {
    this.authService.usernameObservable.subscribe(name => {
      this.username = name;
    });
    this.authService.useraliasObservable.subscribe(alias => {
      this.useralias = alias;
    });
  }

  public login(): void {
    this.authService.login();
  }

  public logout(): void {
    this.authService.logout();
  }

  public isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
