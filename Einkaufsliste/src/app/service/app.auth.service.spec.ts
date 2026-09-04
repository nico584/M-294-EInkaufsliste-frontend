import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom, of } from 'rxjs';

import { AppAuthService } from './app.auth.service';
import { authConfig } from '../app.auth';

function base64UrlEncode(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createToken(payload: object): string {
  const header = base64UrlEncode({ alg: 'none', typ: 'JWT' });
  const body = base64UrlEncode(payload);
  return `${header}.${body}.signature`;
}

describe('AppAuthService', () => {
  function configure(stub: Partial<Record<string, unknown>>) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthConfig, useValue: authConfig },
        { provide: OAuthService, useValue: stub },
      ],
    });
    return TestBed.inject(AppAuthService);
  }

  it('should be created', () => {
    const oauthServiceStub = {
      getAccessToken: () => '',
      getIdentityClaims: () => ({}),
      hasValidAccessToken: () => false,
      events: of(),
      logOut: () => undefined,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);

    expect(service).toBeTruthy();
  });

  it('isAuthenticated should delegate to the OAuthService', () => {
    const oauthServiceStub = {
      getAccessToken: () => '',
      getIdentityClaims: () => ({}),
      hasValidAccessToken: () => true,
      events: of(),
      logOut: () => undefined,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('login should call initLoginFlow on the OAuthService', () => {
    const initLoginFlow = vi.fn();
    const oauthServiceStub = {
      getAccessToken: () => '',
      getIdentityClaims: () => ({}),
      hasValidAccessToken: () => false,
      events: of(),
      logOut: () => undefined,
      initLoginFlow,
    };

    const service = configure(oauthServiceStub);
    service.login();

    expect(initLoginFlow).toHaveBeenCalled();
  });

  it('logout should call logOut on the OAuthService and reset username/alias', async () => {
    const logOut = vi.fn();
    const token = createToken({ given_name: 'Nico', family_name: 'Seiler' });
    const oauthServiceStub = {
      getAccessToken: () => token,
      getIdentityClaims: () => ({ preferred_username: 'nseiler' }),
      hasValidAccessToken: () => true,
      events: of(),
      logOut,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);
    expect(await firstValueFrom(service.usernameObservable)).toBe('Nico Seiler');

    service.logout();

    expect(logOut).toHaveBeenCalled();
    expect(await firstValueFrom(service.usernameObservable)).toBe('');
    expect(await firstValueFrom(service.useraliasObservable)).toBe('');
  });

  it('getIdentityClaims should delegate to the OAuthService', () => {
    const claims = { preferred_username: 'nseiler' };
    const oauthServiceStub = {
      getAccessToken: () => '',
      getIdentityClaims: () => claims,
      hasValidAccessToken: () => false,
      events: of(),
      logOut: () => undefined,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);

    expect(service.getIdentityClaims()).toEqual(claims);
  });

  it('should decode the access token and expose the username, alias and roles', async () => {
    const token = createToken({
      given_name: 'Nico',
      family_name: 'Seiler',
      resource_access: { einkaufsliste: { roles: ['ROLE_ADMIN', 'ROLE_USER'] } },
    });
    const oauthServiceStub = {
      getAccessToken: () => token,
      getIdentityClaims: () => ({ preferred_username: 'nseiler' }),
      hasValidAccessToken: () => true,
      events: of(),
      logOut: () => undefined,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);

    expect(service.accessToken).toBe(token);
    expect(await firstValueFrom(service.usernameObservable)).toBe('Nico Seiler');
    expect(await firstValueFrom(service.useraliasObservable)).toBe('nseiler');
    expect(await firstValueFrom(service.rolesObservable)).toEqual(['ADMIN', 'USER']);
    expect(await firstValueFrom(service.getRoles())).toEqual(['ADMIN', 'USER']);
  });

  it('should support a single role that is not wrapped in an array', async () => {
    const token = createToken({
      resource_access: { einkaufsliste: { roles: 'ROLE_ADMIN' } },
    });
    const oauthServiceStub = {
      getAccessToken: () => token,
      getIdentityClaims: () => ({}),
      hasValidAccessToken: () => true,
      events: of(),
      logOut: () => undefined,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);

    expect(await firstValueFrom(service.rolesObservable)).toEqual(['ADMIN']);
  });

  it('should expose no roles when the token has none', async () => {
    const token = createToken({ given_name: 'Nico', family_name: 'Seiler' });
    const oauthServiceStub = {
      getAccessToken: () => token,
      getIdentityClaims: () => ({}),
      hasValidAccessToken: () => true,
      events: of(),
      logOut: () => undefined,
      initLoginFlow: () => undefined,
    };

    const service = configure(oauthServiceStub);

    expect(await firstValueFrom(service.rolesObservable)).toEqual([]);
  });
});
