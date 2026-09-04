import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { UserService } from './user.service';
import { User } from '../data/user';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.backendBaseUrl + 'user';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList should GET all users', () => {
    const users: User[] = [{ id: 1, username: 'nseiler', firstName: 'Nico', lastName: 'Seiler' }];

    service.getList().subscribe(result => {
      expect(result).toEqual(users);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(users);
  });

  it('getOne should GET a single user by id', () => {
    const user: User = { id: 1, username: 'nseiler', firstName: 'Nico', lastName: 'Seiler' };

    service.getOne(1).subscribe(result => {
      expect(result).toEqual(user);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('GET');
    req.flush(user);
  });

  it('getMe should GET the current user', () => {
    const user: User = { id: 1, username: 'nseiler', firstName: 'Nico', lastName: 'Seiler' };

    service.getMe().subscribe(result => {
      expect(result).toEqual(user);
    });

    const req = httpMock.expectOne(baseUrl + '/me');
    expect(req.request.method).toBe('GET');
    req.flush(user);
  });

  it('update should PUT an existing user', () => {
    const user: User = { id: 1, username: 'nseiler', firstName: 'Nico', lastName: 'Seiler' };

    service.update(user).subscribe(result => {
      expect(result).toEqual(user);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(user);
    req.flush(user);
  });

  it('delete should DELETE a user by id', () => {
    service.delete(1).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(baseUrl + '/1');
    expect(req.request.method).toBe('DELETE');
    req.flush('', { status: 200, statusText: 'OK' });
  });
});
