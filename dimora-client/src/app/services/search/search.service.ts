import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchModel } from '../../models/search.model';
import { environment } from '../../../environments/environment';
import {RoomModel} from '../../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  searchRooms(searchParams: SearchModel) {
      return this.http.post<RoomModel[]>(`${environment.apiUrl}rooms/search`,searchParams);
  }
}
