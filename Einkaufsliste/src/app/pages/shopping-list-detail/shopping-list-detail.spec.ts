import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { of } from 'rxjs';

import { ShoppingListDetail } from './shopping-list-detail';
import { authConfig } from '../../app.auth';
import { routes } from '../../app.routes';
import { Category } from '../../data/category';
import { Item } from '../../data/item';
import { ShoppingList } from '../../data/shopping-list';
import { environment } from '../../../environments/environment';

describe('ShoppingListDetail', () => {
  let component: ShoppingListDetail;
  let fixture: ComponentFixture<ShoppingListDetail>;
  let httpMock: HttpTestingController;

  const shoppingList: ShoppingList = { id: 1, name: 'Wocheneinkauf', description: 'Für die Woche', items: [] };
  const items: Item[] = [{ id: 1, name: 'Milch', note: '', quantity: 1, done: false, category: null }];

  const oauthServiceStub = {
    getAccessToken: () => '',
    getIdentityClaims: () => ({}),
    hasValidAccessToken: () => false,
    events: of(),
    logOut: () => undefined,
    initLoginFlow: () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListDetail],
      providers: [
        { provide: AuthConfig, useValue: authConfig },
        { provide: OAuthService, useValue: oauthServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter(routes),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', '1']]) } },
        },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne(environment.backendBaseUrl + 'category').flush([] as Category[]);
    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1').flush(shoppingList);
    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item').flush(items);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load the shopping list with its items', () => {
    expect(component).toBeTruthy();
    expect(component.shoppingList).toEqual(shoppingList);
    expect(component.itemsDataSource.data).toEqual(items);
  });

  it('reloadData should refresh list and items', () => {
    component.reloadData();

    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1').flush(shoppingList);
    const req = httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item');
    req.flush([]);

    expect(component.itemsDataSource.data).toEqual([]);
  });

  it('back should navigate to the shopping list overview', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await component.back();

    expect(navigateSpy).toHaveBeenCalledWith(['shoppinglists']);
  });

  it('toggleDone should call the toggle endpoint and reload data', () => {
    component.toggleDone(items[0]);

    const req = httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item/1/toggle');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...items[0], done: true });

    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1').flush(shoppingList);
    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item').flush(items);
  });

  it('addItem should open the item dialog and save a new item on confirmation', () => {
    const dialog = TestBed.inject(MatDialog);
    const newItem = new Item();
    newItem.name = 'Brot';
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(newItem) } as never);

    component.addItem();

    const req = httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item');
    expect(req.request.method).toBe('POST');
    req.flush(newItem);

    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1').flush(shoppingList);
    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item').flush(items);
  });

  it('editItem should open the item dialog and update the item on confirmation', () => {
    const dialog = TestBed.inject(MatDialog);
    const updated = { ...items[0], name: 'Milch (laktosefrei)' };
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(updated) } as never);

    component.editItem(items[0]);

    const req = httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);

    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1').flush(shoppingList);
    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item').flush(items);
  });

  it('editItem should do nothing when the dialog is dismissed', () => {
    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(undefined) } as never);

    component.editItem(items[0]);

    httpMock.expectNone(environment.backendBaseUrl + 'shoppinglist/1/item/1');
  });

  it('deleteItem should call the delete endpoint and reload data on confirmation', () => {
    const dialog = TestBed.inject(MatDialog);
    const snackBar = TestBed.inject(MatSnackBar);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');

    component.deleteItem(items[0]);

    const req = httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item/1');
    expect(req.request.method).toBe('DELETE');
    req.flush('', { status: 200, statusText: 'OK' });

    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1').flush(shoppingList);
    httpMock.expectOne(environment.backendBaseUrl + 'shoppinglist/1/item').flush(items);

    expect(snackSpy).toHaveBeenCalled();
  });

  it('deleteItem should not call the delete endpoint when dismissed', () => {
    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as never);

    component.deleteItem(items[0]);

    httpMock.expectNone(environment.backendBaseUrl + 'shoppinglist/1/item/1');
  });
});
