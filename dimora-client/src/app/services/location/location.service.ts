import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';

export interface Province {
  province_id: string;
  province_name: string;
  province_type: string;
}

export interface District {
  district_id: string;
  district_name: string;
  district_type: string;
}

export interface Ward {
  ward_id: string;
  ward_name: string;
  ward_type: string;
}

// API Response interfaces
interface VNAppMobProvinceResponse {
  results: Province[];
}

interface VNAppMobDistrictResponse {
  results: District[];
}

interface VNAppMobWardResponse {
  results: Ward[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  
  private readonly API_BASE_URL = 'https://api.vnappmob.com/api/v2/province';

  constructor(private http: HttpClient) { }

  // Lấy danh sách tất cả tỉnh thành
  getProvinces(): Observable<Province[]> {
    return this.http.get<VNAppMobProvinceResponse>(`${this.API_BASE_URL}/`).pipe(
      map(response => response.results),
      catchError(error => {
        console.error('Error fetching provinces:', error);
        return of([]);
      })
    );
  }

  // Lấy danh sách quận huyện theo tỉnh thành
  getDistrictsByProvince(provinceId: string): Observable<District[]> {
    return this.http.get<VNAppMobDistrictResponse>(`${this.API_BASE_URL}/district/${provinceId}`).pipe(
      map(response => response.results),
      catchError(error => {
        console.error('Error fetching districts:', error);
        return of([]);
      })
    );
  }

  // Lấy danh sách phường xã theo quận huyện
  getWardsByDistrict(districtId: string): Observable<Ward[]> {
    return this.http.get<VNAppMobWardResponse>(`${this.API_BASE_URL}/ward/${districtId}`).pipe(
      map(response => response.results),
      catchError(error => {
        console.error('Error fetching wards:', error);
        return of([]);
      })
    );
  }

  // Tìm kiếm tỉnh thành theo tên
  searchProvinces(query: string): Observable<Province[]> {
    return this.getProvinces().pipe(
      map(provinces => 
        provinces.filter(province => 
          province.province_name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  // Tìm kiếm quận huyện theo tên và tỉnh thành
  searchDistricts(provinceId: string, query: string): Observable<District[]> {
    return this.getDistrictsByProvince(provinceId).pipe(
      map(districts => 
        districts.filter(district => 
          district.district_name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  // Tìm kiếm phường xã theo tên và quận huyện
  searchWards(districtId: string, query: string): Observable<Ward[]> {
    return this.getWardsByDistrict(districtId).pipe(
      map(wards => 
        wards.filter(ward => 
          ward.ward_name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  // Lấy thông tin tỉnh thành theo ID
  getProvinceById(provinceId: string): Observable<Province | null> {
    return this.getProvinces().pipe(
      map(provinces => 
        provinces.find(p => p.province_id === provinceId) || null
      )
    );
  }

  // Lấy thông tin quận huyện theo ID
  getDistrictById(provinceId: string, districtId: string): Observable<District | null> {
    return this.getDistrictsByProvince(provinceId).pipe(
      map(districts => 
        districts.find(d => d.district_id === districtId) || null
      )
    );
  }
}