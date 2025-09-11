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
    console.log(room)
    formData.append('title', room.title);
    formData.append('description', room.description);
    formData.append('room_type_id', room.room_type_id);
    formData.append('location', room.location);
    formData.append('address', room.address);
    formData.append('city', room.city);
    formData.append('country', room.country);
    formData.append('latitude', room.latitude);
    formData.append('longitude', room.longitude);
    formData.append('max_guests', room.max_guests);
    formData.append('bedrooms', room.bedrooms);
    formData.append('beds', room.beds);
    formData.append('bathrooms', room.bathrooms);
    formData.append('price_per_night', room.price_per_night);
    room.amenities.forEach((element: any) => {
      formData.append('amenities', element);
    });
    room.images.forEach((element: any) => {
      formData.append('images', element);
    });
    formData.append('host_id', room.host_id);
    formData.append('is_available', room.is_available);
    formData.append('created_at', room.created_at);
    formData.append('updated_at', room.updated_at);

    console.log(formData)
    return this.http.post<RoomModel>(`${environment.apiUrl}rooms`, formData,{
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }

  deleteRoom(roomId: string, idToken: string, hostId: string){
    return this.http.delete<RoomModel[]>(`${environment.apiUrl}rooms?id=${roomId}&host_id=${hostId}`,{
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }
}
