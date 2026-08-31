import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { authConfig } from '../../app.auth';

import { AppLogin } from './app-login';

describe('AppLogin', () => {
  let component: AppLogin;
  let fixture: ComponentFixture<AppLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }),
        AppLogin,
      ],
      providers: [{ provide: AuthConfig, useValue: authConfig }],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(AppLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a login button when not authenticated', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-login__btn')?.textContent).toContain('Login');
  });
});
