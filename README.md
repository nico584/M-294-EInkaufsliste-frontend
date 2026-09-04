# Game-Collection — Angular Frontend (ÜK Demoprojekt)

Referenz-Dokumentation dieses Demoprojekts. Sie beschreibt **alle** Technologien, Konfigurationen,
Konventionen und Bausteine so vollständig, dass ein neues Projekt mit **identischer Struktur**
von Grund auf nachgebaut werden kann.

Die Anwendung ist ein CRUD-Frontend für eine Spielesammlung (`Game` / `Genre` / `Platform`) mit
Keycloak-Anbindung (OIDC) und rollenbasierter Autorisierung.

---

## 1. Technologie-Stack

| Bereich | Technologie | Version |
|---|---|---|
| Framework | Angular (standalone APIs, kein NgModule) | `^21.2.0` |
| Sprache | TypeScript (strict) | `~5.9.2` |
| Build | `@angular/build:application` (esbuild/Vite) | `^21.2.11` |
| UI | Angular Material + CDK | `^21.2.0` |
| Styles | SCSS | — |
| Auth | `angular-oauth2-oidc` (OIDC Code Flow + PKCE) | `^20.0.2` |
| Token-Parsing | `@auth0/angular-jwt` (`JwtHelperService`) | `^5.2.0` |
| Reaktiv | RxJS | `~7.8.0` |
| Datum | moment + `@angular/material-moment-adapter` | `^2.30.1` |
| Tests | **Vitest** (via `@angular/build:unit-test`) + jsdom | `^4.1.7` |
| Coverage | `@vitest/coverage-v8` | `^4.1.7` |
| Browser-Tests (optional) | `@vitest/browser-playwright` | `^4.1.7` |
| Linting | ESLint 8 + `angular-eslint` 21 + `typescript-eslint` | `8.57.1` |
| i18n | `@angular/localize` | `^21.2.0` |

**Backend (nicht in diesem Repo):** REST-API auf `http://localhost:9090/api/`
**IdP (nicht in diesem Repo):** Keycloak auf `http://localhost:8080`, Realm `ILV`, Client `demoapp`

---

## 2. Projektstruktur

```
.
├── .editorconfig              # 2 Spaces, UTF-8, single quotes in *.ts
├── .eslintrc.json             # ESLint (Legacy-Config-Format, kein Flat Config)
├── .gitignore
├── .vscode/                   # extensions.json, settings.json, tasks.json
├── angular.json               # Build-/Serve-/Test-/Lint-Targets
├── package.json
├── tsconfig.json              # Basis (strict)
├── tsconfig.app.json          # App-Compile
├── tsconfig.spec.json         # Test-Compile (types: vitest/globals)
├── vitest.config.ts           # Test-Runner-Konfiguration
└── src
    ├── index.html             # <app-root>, Roboto + Material Icons, class="mat-typography"
    ├── main.ts                # bootstrapApplication(App, appConfig)
    ├── styles.scss            # globale Styles
    ├── test-setup.ts          # TestBed.initTestEnvironment(...)
    ├── favicon.ico
    ├── assets/                # statische Dateien (.gitkeep)
    ├── environments/
    │   ├── environment.ts       # DEV: backendBaseUrl / frontendBaseUrl
    │   └── environment.prod.ts  # PROD (via fileReplacements ersetzt)
    └── app
        ├── app.ts             # Root-Component (Toolbar, Menü, RouterOutlet)
        ├── app.html
        ├── app.scss
        ├── app.spec.ts
        ├── app.config.ts      # ApplicationConfig: alle Provider
        ├── app.routes.ts      # Routen inkl. Guards + data.roles/pagetitle
        ├── app.auth.ts        # AuthConfig für Keycloak
        ├── app.roles.ts       # enum AppRoles
        ├── components/        # wiederverwendbare UI-Bausteine
        │   ├── app-login/         # Login-/Logout-Button + Benutzeranzeige
        │   └── confirm-dialog/    # Ja/Nein-Bestätigungsdialog
        ├── data/              # Modelle (Klassen mit Defaults)
        │   ├── game.ts
        │   ├── genre.ts
        │   └── platform.ts
        ├── directives/
        │   └── app-is-in-roles.dir.ts   # *appIsInRoles strukturelle Direktive
        ├── guard/
        │   └── app.auth.guard.ts        # appCanActivate / appCanActivateChild
        ├── pages/             # geroutete Seiten (lazy geladen)
        │   ├── game-list/         # Tabelle + Löschen + Navigation
        │   ├── game-detail/       # Reactive Form (erfassen/bearbeiten)
        │   └── no-access/         # Fehlerseite bei fehlender Berechtigung
        └── service/           # HTTP-Services + Auth-Service
            ├── app.auth.service.ts
            ├── game.service.ts
            ├── genre.service.ts
            └── platform.service.ts
```

Jede Component besteht aus vier Dateien: `*.ts`, `*.html`, `*.scss`, `*.spec.ts`.

### Namenskonventionen (Angular-21-Stil, ohne Suffixe)

| Artefakt | Dateiname | Klassenname |
|---|---|---|
| Component | `game-list.ts` / `.html` / `.scss` / `.spec.ts` | `GameList` |
| Service | `game.service.ts` | `GameService` |
| Directive | `app-is-in-roles.dir.ts` | `IsInRolesDirective` |
| Guard | `app.auth.guard.ts` | `appCanActivate` (Funktion) |
| Model | `game.ts` | `Game` |

* **Kein** `.component.ts`-Suffix (Angular-21-Default).
* Component-Selector-Prefix: `app-` (kebab-case), Directive-Prefix: `app` (camelCase) — per ESLint erzwungen.
* Ordner = Verantwortlichkeit: `components/` (wiederverwendbar), `pages/` (geroutet), `service/`, `data/`, `guard/`, `directives/`.

---

## 3. Konfigurationsdateien im Detail

### `angular.json`

* Projektname: `games`, `sourceRoot: "src"`, `prefix: "app"`
* Schematics: `style: "scss"`, `strict: true`
* **build**: `@angular/build:application`, Entry `src/main.ts`, `inlineStyleLanguage: "scss"`, Styles `src/styles.scss`
  * `production`: Budgets (initial 500 kb warn / 1 mb error, Component-Style 2 kb / 4 kb), `outputHashing: "all"`, **fileReplacements** `environment.ts` → `environment.prod.ts`
  * `development`: `optimization: false`, `sourceMap: true`, `namedChunks: true`, `extractLicenses: false`
  * `defaultConfiguration: "production"`
* **serve**: `@angular/build:dev-server` (Default `development`)
* **test**: `@angular/build:unit-test` mit `tsConfig: tsconfig.spec.json` und `runnerConfig: vitest.config.ts`
* **lint**: `@angular-eslint/builder:lint` über `src/**/*.ts` und `src/**/*.html`
* `cli.schematicCollections: ["@angular-eslint/schematics"]` — generierte Artefakte sind direkt lint-konform

### `tsconfig.json` (strikte Einstellungen)

`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`,
`noFallthroughCasesInSwitch`, `isolatedModules`, `experimentalDecorators`, `importHelpers`,
`skipLibCheck`, Target `ES2022`, Module `preserve`.
Angular-Compiler: `strictInjectionParameters`, `strictInputAccessModifiers`, `strictTemplates`,
`enableI18nLegacyMessageIdFormat: false`.
Die Datei nutzt Project References auf `tsconfig.app.json` und `tsconfig.spec.json`.

> Wegen `noPropertyAccessFromIndexSignature` wird auf Route-Daten und Claims immer per
> Bracket-Notation zugegriffen: `route.data['roles']`, `claims['preferred_username']`.

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
```

### `src/test-setup.ts`

```ts
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
```

### `.eslintrc.json`

Legacy-Format (`root: true`, `overrides`). Für `*.ts`: `eslint:recommended`,
`@typescript-eslint/recommended`, `@angular-eslint/recommended`, `process-inline-templates`.
`@typescript-eslint/no-explicit-any` ist **aus**. Selector-Regeln: Component
`element / app / kebab-case`, Directive `attribute / app / camelCase`.
Für `*.html`: `@angular-eslint/template/recommended` und `.../accessibility`.

### `.editorconfig`

UTF-8, 2 Spaces, finale Leerzeile, kein Trailing Whitespace, `quote_type = single` für `*.ts`.

---

## 4. Umgebungen

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  backendBaseUrl: 'http://localhost:9090/api/',   // Slash am Ende ist Teil der URL-Bildung!
  frontendBaseUrl: 'http://localhost:4200'
};
```

`environment.prod.ts` hat dieselbe Form mit `production: true` und wird beim Production-Build
per `fileReplacements` eingesetzt. **Wichtig:** `backendBaseUrl` endet auf `/`, weil die Services
per String-Konkatenation `environment.backendBaseUrl + 'game'` bauen.

---

## 5. Bootstrapping & Provider (`app.config.ts`)

Standalone-Bootstrap ohne `AppModule`:

```ts
// main.ts
bootstrapApplication(App, appConfig).catch(err => console.error(err));
```

`appConfig.providers` enthält:

1. `provideBrowserGlobalErrorListeners()`
2. `provideRouter(routes)`
3. `importProvidersFrom(BrowserModule)`
4. `{ provide: AuthConfig, useValue: authConfig }` — Keycloak-Konfiguration injizierbar machen
5. `{ provide: OAuthStorage, useFactory: storageFactory }` mit `storageFactory() { return sessionStorage; }`
   → Tokens landen im **sessionStorage** statt localStorage
6. `provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))`
7. `provideOAuthClient({ resourceServer: { sendAccessToken: true, allowedUrls: [environment.backendBaseUrl] } })`
   → Access-Token wird automatisch an Requests ans Backend angehängt
8. `provideEnvironmentInitializer(() => inject(AppAuthService).initAuth().finally())`
   → Auth-Initialisierung beim App-Start

---

## 6. Authentifizierung (OIDC / Keycloak)

### `app.auth.ts`

```ts
export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/ILV',
  requireHttps: false,
  redirectUri: environment.frontendBaseUrl,
  postLogoutRedirectUri: environment.frontendBaseUrl,
  clientId: 'demoapp',
  scope: 'openid profile roles offline_access',
  responseType: 'code',              // Authorization Code Flow + PKCE
  showDebugInformation: true,
  requestAccessToken: true,
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
  silentRefreshTimeout: 500,
  clearHashAfterLogin: true,
  waitForTokenInMsec: 1000
};
```

### `AppAuthService` (`service/app.auth.service.ts`)

Zentraler Auth-Service (`providedIn: 'root'`):

* `initAuth()` — `configure()`, Event-Subscription, `loadDiscoveryDocumentAndTryLogin()`, `setupAutomaticSilentRefresh()`
* `login()` / `logout()` / `isAuthenticated()`
* `getRoles(): Observable<string[]>` — liest aus dem dekodierten Access-Token
  `resource_access.demoapp.roles` und entfernt das Präfix `ROLE_`
* `getIdentityClaims()`
* Reaktive Zustände als privates `BehaviorSubject` + öffentliches `Observable`:
  `usernameObservable` (`given_name + ' ' + family_name`),
  `useraliasObservable` (`preferred_username`), `accessTokenObservable`
* Token-Dekodierung mit `JwtHelperService` aus `@auth0/angular-jwt`
* `handleEvents(event)` reagiert auf OAuth-Events und aktualisiert Token + Subjects

---

## 7. Rollen & Autorisierung

### Rollen-Enum (`app.roles.ts`)

```ts
export enum AppRoles {
  Read   = 'read',
  Update = 'update',
  Admin  = 'admin'
}
```

Die Rollen müssen in Keycloak als **Client-Rollen des Clients `demoapp`** existieren und
Benutzern zugewiesen sein. Sie landen im Access-Token unter `resource_access.demoapp.roles`.

| Rolle | Berechtigung in der App |
|---|---|
| `read` | Spieleliste `/games` ansehen |
| `update` | Spiel bearbeiten `/game/:id`, Edit-Button sichtbar |
| `admin` | Spiel erfassen `/game`, Löschen-Button sichtbar |

### Route-Guard (`guard/app.auth.guard.ts`)

`appCanActivate: CanActivateFn` prüft zweistufig:

1. `oauthService.hasValidAccessToken()` — sonst `router.parseUrl('/noaccess')`
2. `checkRoles(route, userRoles)` — vergleicht `route.data['roles']` mit den Token-Rollen
   (**ODER**-Logik: eine passende Rolle genügt). Leere/fehlende `roles` ⇒ Zugriff erlaubt.

Zusätzlich exportiert: `appCanActivateChild: CanActivateChildFn`, delegiert an `appCanActivate`.

### Struktur-Direktive (`directives/app-is-in-roles.dir.ts`)

Blendet UI-Elemente rollenabhängig ein/aus (**UND**-Logik: alle angegebenen Rollen nötig):

```html
<button *appIsInRoles="[roles.Admin]" (click)="delete(element)">…</button>
```

Implementierung: `TemplateRef` + `ViewContainerRef`, Subscription auf `authService.getRoles()`,
Aufräumen via `takeUntil(this.stop$)` in `ngOnDestroy`.

---

## 8. Routing (`app.routes.ts`)

| Pfad | Component (lazy) | Guard | `data.roles` | `data.pagetitle` |
|---|---|---|---|---|
| `games` | `GameList` | `appCanActivate` | `[Read]` | `Alle Spiele` |
| `game/:id` | `GameDetail` | `appCanActivate` | `[Update]` | `Spiel bearbeiten` |
| `game` | `GameDetail` | `appCanActivate` | `[Admin]` | `Spiel erfassen` |
| `noaccess` | `NoAccess` (eager) | — | — | — |

Lazy Loading durchgängig über `loadComponent: () => import('./pages/…').then(c => c.GameList)`.
`data.pagetitle` wird von der Root-Component über `RoutesRecognized`-Events ausgelesen und in
der Toolbar angezeigt.

---

## 9. Datenmodelle (`data/`)

Klassen mit Default-Werten (nicht Interfaces), damit `new Game()` ein befülltes Formularobjekt liefert:

```ts
export class Game {
  public id!: number
  public name = ''
  public publisher = ''
  public multiplayer = false
  public platforms: Array<Platform> = []
  public genre: Genre = new Genre()
}

export class Genre    { public id!: number; public name = '' }
export class Platform { public id!: number; public name = '' }
```

---

## 10. Services — einheitliches CRUD-Muster

`GameService`, `GenreService` und `PlatformService` sind **identisch aufgebaut** — die Vorlage für
jede neue Entität:

```ts
@Injectable({ providedIn: 'root' })
export class GameService {
  public static readonly backendUrl = 'game';   // Ressourcen-Pfad, auch in Tests genutzt
  private http = inject(HttpClient);

  getList():          Observable<Game[]>                 // GET    {base}game
  getOne(id):         Observable<Game>                   // GET    {base}game/{id}
  update(g: Game):    Observable<Game>                   // PUT    {base}game/{id}
  save(g: Game):      Observable<Game>                   // POST   {base}game
  delete(id: number): Observable<HttpResponse<string>>   // DELETE {base}game/{id}, observe: 'response'
}
```

`delete` gibt bewusst die volle `HttpResponse` zurück, damit der Aufrufer `response.status === 200`
prüfen kann. Dependency Injection erfolgt durchgängig über die `inject()`-Funktion, nicht über
Konstruktor-Parameter.

### Erwartete Backend-Endpunkte

```
GET    /api/game          GET /api/game/{id}    POST /api/game
PUT    /api/game/{id}     DELETE /api/game/{id}
GET    /api/genre         …  (analog)
GET    /api/platform      …  (analog)
```

---

## 11. Components & Pages

### `App` (Root, `app.ts` / `app.html`)

Standalone mit `imports: [MatToolbar, MatButton, MatIcon, MatMenuModule, RouterLink, AppLogin, RouterOutlet]`.
Toolbar mit Burger-Menü (Home, Spiele), Titel `Game-Collection`, dynamischem `pagetitle`
und `<app-login>`. Content in `<main class="container"><div class="container__section"><router-outlet>`.
Der `pagetitle` wird im Konstruktor aus `router.events` (`RoutesRecognized`) gesetzt.

### `AppLogin` (`components/app-login/`)

Zeigt Benutzernamen als `mat-chip` sowie Login- bzw. Logout-Button; abonniert
`usernameObservable` / `useraliasObservable` in `ngOnInit`.

### `ConfirmDialog` (`components/confirm-dialog/`)

Generischer Ja/Nein-Dialog. Injiziert `MatDialogRef` und `MAT_DIALOG_DATA`, schliesst mit
`true`/`false`. Datenvertrag: `export interface DialogData { title: string; message: string; }`.

### `GameList` (`pages/game-list/`)

* `MatTableDataSource<Game>`, Spalten `['name','publisher','multiplayer','platforms','genre','actions']`
* `<mat-text-column>` für einfache Spalten, `ng-container matColumnDef` für Custom-Zellen
  (Icon für Multiplayer, `mat-chip-set` für Plattformen)
* Löschen: `MatDialog` → `ConfirmDialog` → `service.delete()` → `MatSnackBar`-Feedback (4000 ms) → Reload
* Aktions-Buttons mit `*appIsInRoles`
* Navigation via `router.navigate(['game', obj.id])` bzw. `router.navigate(['game'])`

### `GameDetail` (`pages/game-detail/`)

* Reactive Forms: `FormGroup` mit `FormControl` / `UntypedFormControl`
* Stammdaten via `forkJoin([platformService.getList(), genreService.getList()])`; im
  `complete`-Callback wird bei vorhandener Route-`id` das Spiel geladen und `patchValue()` gesetzt
* `compareOptions(o1, o2)` als `[compareWith]` für `mat-select` (Objektvergleich über `id`)
* `save()` entscheidet anhand `game.id` zwischen `update()` und `save()`, danach `router.navigate(['games'])`
* Mehrfachauswahl der Plattformen über `<mat-select multiple>`, Multiplayer über `mat-radio-group`

### `NoAccess` (`pages/no-access/`)

`mat-card` mit Warn-Icon und Text „Zugriff nicht erlaubt“.

### Template-Syntax

Durchgängig **neue Control-Flow-Syntax**: `@if`, `@else`, `@for (… ; track …)`.
Ausnahme: strukturelle Direktiven der Material-Tabelle (`*matHeaderCellDef`, `*matCellDef`,
`*matHeaderRowDef`, `*matRowDef`) sowie die eigene `*appIsInRoles`.

### Verwendete Material-Module

`MatToolbar`, `MatMenuModule`, `MatButton` / `MatIconButton`, `MatIcon`, `MatChip` / `MatChipSet`,
`MatTableModule`, `MatDialogModule`, `MatSnackBar`, `MatCard`, `MatFormField` / `MatLabel` / `MatHint`,
`MatInput`, `MatSelect` / `MatOption`, `MatRadioGroup` / `MatRadioButton`.

---

## 12. Tests

**Runner:** Vitest über den Angular-Builder (`@angular/build:unit-test`), Umgebung `jsdom`,
Globals aktiv (`describe` / `it` / `expect` ohne Import verfügbar; teilweise wird
`import { expect } from 'vitest'` trotzdem gesetzt).

Vorhandene Specs: `app.spec.ts`, `app-login.spec.ts`, `confirm-dialog.spec.ts`,
`game-list.spec.ts`, `game-detail.spec.ts`, `no-access.spec.ts`,
`game.service.spec.ts`, `platform.service.spec.ts`.

### Muster A — Component-Test

```ts
await TestBed.configureTestingModule({
  imports: [
    OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }),
    MatDialogModule, MatSnackBarModule,
    GameList,                                   // standalone Component direkt importieren
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting(),
    provideAnimations(),
    { provide: AuthConfig, useValue: authConfig },
  ],
  teardown: { destroyAfterEach: true }
}).compileComponents();
```

Danach `TestBed.createComponent(...)`, `fixture.detectChanges()`, `expect(component).toBeTruthy()`.
`app.spec.ts` prüft zusätzlich den gerenderten Titel via
`compiled.querySelector('mat-toolbar header')?.textContent` sowie den initialen `pagetitle`.

### Muster B — Service-Test mit `HttpTestingController`

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
  teardown: { destroyAfterEach: true },
});
service  = TestBed.inject(GameService);
httpMock = TestBed.inject(HttpTestingController);

service.getList().subscribe({ next: games => expect(games).toHaveLength(2) });
const req = httpMock.expectOne(environment.backendBaseUrl + GameService.backendUrl);
expect(req.request.method).toBe('GET');
req.flush(fakeGames);
```

Abgedeckte Fälle in `game.service.spec.ts`: `should be created`, GET-Liste, POST-Anlegen,
PUT-Aktualisieren, DELETE (Status 200). Testdaten liegen als `fakeGames`-Array im Spec.

**Wichtige Bausteine für Tests:** immer `AuthConfig` bereitstellen und `OAuthModule.forRoot(...)`
importieren, sobald eine Component (direkt oder indirekt) den `AppAuthService` nutzt.
Für Material-Animationen `provideAnimations()` ergänzen.

---

## 13. NPM-Skripte

```bash
npm start        # ng serve  → http://localhost:4200
npm run build    # ng build  → dist/ (Production, Budgets + Hashing)
npm run watch    # ng build --watch --configuration development
npm test         # ng test   → Vitest
npm run lint     # ng lint   → ESLint über *.ts und *.html
```

VS Code `tasks.json` bindet `start` und `test` als Hintergrund-Tasks ein;
`extensions.json` empfiehlt `angular.ng-template`; `settings.json` setzt `editor.tabSize: 2`.

---

## 14. Setup eines neuen Projekts mit identischer Struktur

```bash
# 1) Projekt anlegen (SCSS, Routing, kein SSR)
npx @angular/cli@21 new games --style=scss --routing --ssr=false

# 2) Abhängigkeiten
ng add @angular/material            # Roboto/Icons + Theme
npm i @angular/material-moment-adapter moment
npm i angular-oauth2-oidc @auth0/angular-jwt
npm i @angular/localize

# 3) Linting
ng add @angular-eslint/schematics

# 4) Test-Stack auf Vitest umstellen
npm i -D vitest @vitest/coverage-v8 @vitest/browser-playwright jsdom
#    angular.json: test-Builder auf @angular/build:unit-test mit
#    runnerConfig "vitest.config.ts" setzen, vitest.config.ts + src/test-setup.ts anlegen,
#    tsconfig.spec.json auf "types": ["vitest/globals"] setzen
```

Danach:

1. `src/environments/environment.ts` + `environment.prod.ts` anlegen und in `angular.json`
   unter `production.fileReplacements` verdrahten.
2. Ordner `app/{components,data,directives,guard,pages,service}` anlegen.
3. `app.roles.ts`, `app.auth.ts`, `app.auth.service.ts`, `app.auth.guard.ts` und
   `app-is-in-roles.dir.ts` übernehmen und an den eigenen Keycloak-Client anpassen
   (`issuer`, `clientId`, sowie den Pfad `resource_access.<clientId>.roles` in `getRoles()`).
4. `app.config.ts` mit den Providern aus Abschnitt 5 füllen.
5. `index.html` um Roboto-Font und Material-Icons ergänzen, `<body class="mat-typography">` setzen.
6. Pro Entität: Modell in `data/`, Service nach dem CRUD-Muster aus Abschnitt 10,
   Listen- und Detailseite in `pages/`, Routen mit `data.roles` / `data.pagetitle`.
7. Specs nach den Mustern A und B aus Abschnitt 12 ergänzen.

### Keycloak-Voraussetzungen

* Realm `ILV`, Client `demoapp`, Client-Typ **public**, Standard Flow (Authorization Code + PKCE)
* Valid Redirect URIs: `http://localhost:4200/*`, Web Origins: `http://localhost:4200`
* Client-Rollen `read`, `update`, `admin` anlegen und Testbenutzern zuweisen
* Client-Scope `roles` muss die `resource_access`-Claims ins Access-Token mappen

---

## 15. Bekannte Stolpersteine in diesem Demoprojekt

Diese Punkte sind beim Nachbau bewusst zu beachten bzw. zu korrigieren:

* **`angular.json` → `assets`** verweist auf den Ordner `public`, tatsächlich existiert aber
  `src/assets`. Entweder `public/` anlegen oder den Eintrag auf `src/assets` (mit
  `"output": "assets"`) und `src/favicon.ico` umstellen.
* **`silent-refresh.html` fehlt** — `silentRefreshRedirectUri` zeigt auf eine Datei, die es im
  Projekt nicht gibt. Für funktionierenden Silent Refresh ergänzen.
* **`app-login.html`**: die Bedingung ist invertiert (`@if (!isAuthenticated())` zeigt den
  Logout-Button). Korrekt wäre `@if (isAuthenticated())`.
* **`initAuth()`** gibt ein Promise zurück, das nie aufgelöst wird (`new Promise<void>(() => …)`
  ohne `resolve`). Für einen sauberen Initializer-Ablauf `resolve()` ergänzen.
* **`app.auth.guard.ts`**: `getRoles()` wird per `subscribe` in eine lokale Variable geschrieben
  und direkt danach ausgewertet. Das funktioniert nur, weil das Observable synchron emittiert —
  sauberer wäre ein Guard, der das Observable zurückgibt.
* **`environment.prod.ts`** zeigt noch auf `localhost` — für ein Deployment anpassen.
* **`@types/jasmine`** ist noch in den devDependencies, obwohl mit Vitest getestet wird
  (Altlast, kann entfernt werden).
* Es gibt **keine Default-Route** (`path: ''`) und keine Wildcard-Route (`path: '**'`);
  der Menüpunkt „Home“ (`routerLink=['']`) führt daher auf eine leere Seite.
