import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { RoomModel } from '../../models/room.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  constructor(private http: HttpClient) { }


  getRoomList() {
    return this.http.get<RoomModel[]>(`${environment.apiUrl}rooms`);
  }

  getRoomById(id: string) {
    return this.http.get<RoomModel>(`${environment.apiUrl}rooms/${id}`);
  }
}
