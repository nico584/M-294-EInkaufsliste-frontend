import {inject, Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthConfig, OAuthErrorEvent, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {BehaviorSubject, Observable, of} from 'rxjs';

interface DecodedAccessToken {
  resource_access?: Record<string, { roles?: string[] | string }>;
  family_name?: string;
  given_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppAuthService {
  private oauthService = inject(OAuthService);
  private authConfig = inject(AuthConfig);
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private usernameSubject = new BehaviorSubject<string>('');
  public readonly usernameObservable: Observable<string> = this.usernameSubject.asObservable();
  private useraliasSubject = new BehaviorSubject<string>('');
  public readonly useraliasObservable: Observable<string> = this.useraliasSubject.asObservable();
  private accessTokenSubject = new BehaviorSubject<string>('');
  public readonly accessTokenObservable: Observable<string> = this.accessTokenSubject.asObservable();

  constructor(
  ) {
    this.handleEvents(null);
  }

  private _decodedAccessToken: DecodedAccessToken | null = null;

  get decodedAccessToken() {
    return this._decodedAccessToken;
  }

  private _accessToken = '';

  get accessToken() {
    return this._accessToken;
  }

  private readyPromise: Promise<void> = Promise.resolve();

  async initAuth(): Promise<void> {
    this.readyPromise = new Promise<void>((resolve) => {
      this.oauthService.configure(this.authConfig);
      this.oauthService.events
        .subscribe(e => this.handleEvents(e));
      this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
        this.oauthService.setupAutomaticSilentRefresh();
        resolve();
      });
    });
    return this.readyPromise;
  }

  public waitForInit(): Promise<void> {
    return this.readyPromise;
  }

  public getRoles(): Observable<string[]> {
    if (this._decodedAccessToken) {
      return new Observable<string[]>(observer => {
        const roles = this._decodedAccessToken?.resource_access?.['einkaufsliste']?.roles;
        if (roles) {
          if (Array.isArray(roles)) {
            observer.next(roles.map((r: string) => r.replace('ROLE_', '')));
          } else {
            observer.next([roles.replace('ROLE_', '')]);
          }
        } else {
          observer.next([]);
        }
      });
    }
    return of([]);
  }

  public getIdentityClaims(): Record<string, unknown> {
    return this.oauthService.getIdentityClaims();
  }

  public isAuthenticated () {
    return this.oauthService.hasValidAccessToken()
  }

  public logout() {
    this.oauthService.logOut();
    this.useraliasSubject.next('');
    this.usernameSubject.next('');
  }

  public login() {
    this.oauthService.initLoginFlow();
  }

  private handleEvents(event: OAuthEvent | null) {
    if (event instanceof OAuthErrorEvent) {
      // console.error(event);
    } else {
      this._accessToken = this.oauthService.getAccessToken();
      this.accessTokenSubject.next(this._accessToken);
      this._decodedAccessToken = this.jwtHelper.decodeToken(this._accessToken);

      if (this._decodedAccessToken?.family_name && this._decodedAccessToken?.given_name) {
        const username = this._decodedAccessToken?.given_name + ' ' + this._decodedAccessToken?.family_name;
        this.usernameSubject.next(username);
      }

      const claims = this.getIdentityClaims();
      if (claims !== null) {
        if (claims['preferred_username'] !== '') {
          this.useraliasSubject.next(claims['preferred_username'] as string);
        }
      }
    }
  }
}
