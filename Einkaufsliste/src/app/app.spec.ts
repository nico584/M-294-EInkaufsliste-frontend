import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { authConfig } from './app.auth';
import { routes } from './app.routes';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }), App],
      providers: [{ provide: AuthConfig, useValue: authConfig }, provideRouter(routes)],
      teardown: { destroyAfterEach: true },
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the app title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('Einkaufsliste');
  });
});
