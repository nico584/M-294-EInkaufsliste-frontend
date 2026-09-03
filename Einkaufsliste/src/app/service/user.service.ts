import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../data/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public static readonly backendUrl = 'user';

  private http = inject(HttpClient);

  public getList(): Observable<User[]> {
    const url = environment.backendBaseUrl + UserService.backendUrl;
    return this.http.get<User[]>(url);
  }

  public getOne(id: number): Observable<User> {
    const url = environment.backendBaseUrl + UserService.backendUrl + `/${id}`;
    return this.http.get<User>(url);
  }

  public getMe(): Observable<User> {
    const url = environment.backendBaseUrl + UserService.backendUrl + '/me';
    return this.http.get<User>(url);
  }

  public update(user: User): Observable<User> {
    const url = environment.backendBaseUrl + UserService.backendUrl + `/${user.id}`;
    return this.http.put<User>(url, user);
  }

  public delete(id: number): Observable<HttpResponse<string>> {
    const url = environment.backendBaseUrl + UserService.backendUrl + `/${id}`;
    return this.http.delete<string>(url, { observe: 'response' });
  }
}
