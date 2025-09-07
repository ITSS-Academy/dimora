import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingModel } from '../../models/booking.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) { }

  getBooking(hostId: string, idToken: string) {
    return this.http.get<BookingModel[]>(`${environment.apiUrl}bookings/user/${hostId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }

  createBooking(booking: BookingModel, idToken: string) {
    return this.http.post<BookingModel>(`${environment.apiUrl}bookings`, booking, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }
}
