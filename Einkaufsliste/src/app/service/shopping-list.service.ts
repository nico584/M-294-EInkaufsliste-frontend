import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ShoppingList } from '../data/shopping-list';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  public static readonly backendUrl = 'shoppinglist';

  private http = inject(HttpClient);

  public getList(): Observable<ShoppingList[]> {
    const url = environment.backendBaseUrl + ShoppingListService.backendUrl;
    return this.http.get<ShoppingList[]>(url);
  }

  public getOne(id: number): Observable<ShoppingList> {
    const url = environment.backendBaseUrl + ShoppingListService.backendUrl + `/${id}`;
    return this.http.get<ShoppingList>(url);
  }

  public save(shoppingList: ShoppingList): Observable<ShoppingList> {
    const url = environment.backendBaseUrl + ShoppingListService.backendUrl;
    return this.http.post<ShoppingList>(url, shoppingList);
  }

  public update(shoppingList: ShoppingList): Observable<ShoppingList> {
    const url = environment.backendBaseUrl + ShoppingListService.backendUrl + `/${shoppingList.id}`;
    return this.http.put<ShoppingList>(url, shoppingList);
  }

  public delete(id: number): Observable<HttpResponse<string>> {
    const url = environment.backendBaseUrl + ShoppingListService.backendUrl + `/${id}`;
    return this.http.delete<string>(url, { observe: 'response' });
  }
}
