import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../data/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  public static readonly backendUrl = 'category';

  private http = inject(HttpClient);

  public getList(): Observable<Category[]> {
    const url = environment.backendBaseUrl + CategoryService.backendUrl;
    return this.http.get<Category[]>(url);
  }

  public getOne(id: number): Observable<Category> {
    const url = environment.backendBaseUrl + CategoryService.backendUrl + `/${id}`;
    return this.http.get<Category>(url);
  }

  public save(category: Category): Observable<Category> {
    const url = environment.backendBaseUrl + CategoryService.backendUrl;
    return this.http.post<Category>(url, category);
  }

  public update(category: Category): Observable<Category> {
    const url = environment.backendBaseUrl + CategoryService.backendUrl + `/${category.id}`;
    return this.http.put<Category>(url, category);
  }

  public delete(id: number): Observable<HttpResponse<string>> {
    const url = environment.backendBaseUrl + CategoryService.backendUrl + `/${id}`;
    return this.http.delete<string>(url, { observe: 'response' });
  }
}
