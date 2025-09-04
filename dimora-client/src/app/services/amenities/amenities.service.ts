import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AmenitiesModel } from '../../models/amenities.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmenitiesService {

  constructor(private http: HttpClient) { }

  getAllAmenities() {
    return this.http.get<AmenitiesModel[]>(`${environment.apiUrl}rooms/convience/amenities`);
  }
}
