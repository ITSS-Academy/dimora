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
      return this.http.get<RoomModel[]>(`${environment.apiUrl}rooms/search?location=${searchParams.location}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}&guests=${searchParams.guests}&minPrice=${searchParams.minPrice}&maxPrice=${searchParams.maxPrice}`);
  }
}
