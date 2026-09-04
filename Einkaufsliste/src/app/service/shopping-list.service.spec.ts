import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ShoppingListService } from './shopping-list.service';
import { ShoppingList } from '../data/shopping-list';
import { environment } from '../../environments/environment';

describe('ShoppingListService', () => {
  let service: ShoppingListService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.backendBaseUrl + 'shoppinglist';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShoppingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList should GET all shopping lists', () => {
    const lists: ShoppingList[] = [{ id: 1, name: 'Wocheneinkauf', description: '', items: [] }];

    service.getList().subscribe(result => {
      expect(result).toEqual(lists);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(lists);
  });

  it('getOne should GET a single shopping list by id', () => {
    const list: ShoppingList = { id: 1, name: 'Wocheneinkauf', description: '', items: [] };

    service.getOne(1).subscribe(result => {
      expect(result).toEqual(list);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('GET');
    req.flush(list);
  });

  it('save should POST a new shopping list', () => {
    const list: ShoppingList = { id: 0, name: 'Fest', description: '', items: [] };

    service.save(list).subscribe(result => {
      expect(result).toEqual(list);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(list);
    req.flush(list);
  });

  it('update should PUT an existing shopping list', () => {
    const list: ShoppingList = { id: 1, name: 'Wocheneinkauf', description: 'Für die Woche', items: [] };

    service.update(list).subscribe(result => {
      expect(result).toEqual(list);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(list);
    req.flush(list);
  });

  it('delete should DELETE a shopping list by id', () => {
    service.delete(1).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('DELETE');
    req.flush('', { status: 200, statusText: 'OK' });
  });
});
