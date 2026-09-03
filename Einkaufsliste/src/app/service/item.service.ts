import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Item } from '../data/item';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  public static readonly backendUrl = 'shoppinglist';

  private http = inject(HttpClient);

  private itemUrl(listId: number): string {
    return environment.backendBaseUrl + ItemService.backendUrl + `/${listId}/item`;
  }

  public getList(listId: number): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemUrl(listId));
  }

  public getOne(listId: number, id: number): Observable<Item> {
    return this.http.get<Item>(this.itemUrl(listId) + `/${id}`);
  }

  public save(listId: number, item: Item): Observable<Item> {
    return this.http.post<Item>(this.itemUrl(listId), item);
  }

  public update(listId: number, item: Item): Observable<Item> {
    return this.http.put<Item>(this.itemUrl(listId) + `/${item.id}`, item);
  }

  public delete(listId: number, id: number): Observable<HttpResponse<string>> {
    return this.http.delete<string>(this.itemUrl(listId) + `/${id}`, { observe: 'response' });
  }

  public toggleDone(listId: number, id: number): Observable<Item> {
    return this.http.patch<Item>(this.itemUrl(listId) + `/${id}/toggle`, {});
  }
}
