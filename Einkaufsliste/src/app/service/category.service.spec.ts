import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { CategoryService } from './category.service';
import { Category } from '../data/category';
import { environment } from '../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.backendBaseUrl + 'category';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList should GET all categories', () => {
    const categories: Category[] = [{ id: 1, name: 'Obst', description: '', color: '#4a90d9' }];

    service.getList().subscribe(result => {
      expect(result).toEqual(categories);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(categories);
  });

  it('getOne should GET a single category by id', () => {
    const category: Category = { id: 1, name: 'Obst', description: '', color: '#4a90d9' };

    service.getOne(1).subscribe(result => {
      expect(result).toEqual(category);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('GET');
    req.flush(category);
  });

  it('save should POST a new category', () => {
    const category: Category = { id: 0, name: 'Gemüse', description: '', color: '#4a90d9' };

    service.save(category).subscribe(result => {
      expect(result).toEqual(category);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(category);
    req.flush(category);
  });

  it('update should PUT an existing category', () => {
    const category: Category = { id: 1, name: 'Obst', description: 'Frisches Obst', color: '#4a90d9' };

    service.update(category).subscribe(result => {
      expect(result).toEqual(category);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(category);
    req.flush(category);
  });

  it('delete should DELETE a category by id', () => {
    service.delete(1).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('DELETE');
    req.flush('', { status: 200, statusText: 'OK' });
  });
});
