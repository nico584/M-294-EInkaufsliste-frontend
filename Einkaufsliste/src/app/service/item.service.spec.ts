import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ItemService } from './item.service';
import { Item } from '../data/item';
import { environment } from '../../environments/environment';

describe('ItemService', () => {
  let service: ItemService;
  let httpMock: HttpTestingController;

  const listId = 1;
  const baseUrl = environment.backendBaseUrl + 'shoppinglist/' + listId + '/item';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(ItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList should GET all items of a shopping list', () => {
    const items: Item[] = [{ id: 1, name: 'Milch', note: '', quantity: 2, done: false, category: null }];

    service.getList(listId).subscribe(result => {
      expect(result).toEqual(items);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(items);
  });

  it('getOne should GET a single item by id', () => {
    const item: Item = { id: 1, name: 'Milch', note: '', quantity: 2, done: false, category: null };

    service.getOne(listId, 1).subscribe(result => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('GET');
    req.flush(item);
  });

  it('save should POST a new item', () => {
    const item: Item = { id: 0, name: 'Brot', note: '', quantity: 1, done: false, category: null };

    service.save(listId, item).subscribe(result => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(item);
    req.flush(item);
  });

  it('update should PUT an existing item', () => {
    const item: Item = { id: 1, name: 'Brot', note: 'Vollkorn', quantity: 1, done: false, category: null };

    service.update(listId, item).subscribe(result => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(item);
    req.flush(item);
  });

  it('delete should DELETE an item by id', () => {
    service.delete(listId, 1).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('DELETE');
    req.flush('', { status: 200, statusText: 'OK' });
  });

  it('toggleDone should PATCH the toggle endpoint', () => {
    const item: Item = { id: 1, name: 'Milch', note: '', quantity: 2, done: true, category: null };

    service.toggleDone(listId, 1).subscribe(result => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne(baseUrl + '/1/toggle');
    expect(req.request.method).toBe('PATCH');
    req.flush(item);
  });
});
