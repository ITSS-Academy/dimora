import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { RoomModel } from '../../models/room.model';
import { environment } from '../../../environments/environment';
import { RoomTypeModel } from '../../models/room_type.model';

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

  getRoomByHostId(hostId: string) {
    return this.http.get<RoomModel[]>(`${environment.apiUrl}rooms/host/${hostId}`);
  }

  getRoomTypeList() {
    return this.http.get<RoomTypeModel[]>(`${environment.apiUrl}room-types`);
  }

  createRoom(room: any, idToken: string) {
//create rooms use formData
    const formData = new FormData();
    Object.keys(room).forEach(key => {
      formData.append(key, room[key]);
    });
    return this.http.post<RoomModel>(`${environment.apiUrl}rooms`, formData,{
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }
}
