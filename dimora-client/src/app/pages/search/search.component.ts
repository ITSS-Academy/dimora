import {Component, ViewChild} from '@angular/core';
import {MapComponent} from '../../shared/components/map/map.component';
import {DecimalPipe} from '@angular/common';
import {GoogleMap, MapMarker} from '@angular/google-maps';
interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface Hotel {
  id: number;
  name: string;
  price: number;
  address: string;
  location: google.maps.LatLngLiteral;
  image: string;
  rating?: number;
  distance?: number;
  isGuestFavorite?: boolean;
  beds?: string;
  cancellation?: string;
  reviewCount?: number;
}
@Component({
  selector: 'app-search',
  imports: [
    DecimalPipe,
    GoogleMap,
    MapMarker
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @ViewChild(GoogleMap) map!: GoogleMap;

  // Map settings
  center: google.maps.LatLngLiteral = { lat: 10.774559, lng: 106.675655 }; // Vị trí hiện tại
  zoom = 12;
  isMapReady = false;

  // Current location
  currentLocation: Location | null = null;
  isGettingLocation = false;
  locationError = '';

  // Hotels
  hotels: Hotel[] = [];
  selectedHotel: Hotel | null = null;
  visibleHotels: Hotel[] = [];
  mapCenter: google.maps.LatLngLiteral = { lat: 10.774559, lng: 106.675655 };
  showSelectedHotelInfo: boolean = false;
  showDialog: boolean = false;
  dialogHotel: Hotel | null = null;

  constructor() {}

  ngOnInit() {
    console.log('🚀 App component initialized');
    this.initializeHotels();
    this.setCurrentLocationAsDefault();

    // Debug map after view init
    setTimeout(() => {
      console.log('🗺️ Map instance:', this.map);
      if (this.map) {
        console.log('🗺️ Map is ready');
      }
    }, 1000);
  }

  // Initialize hotels data
  initializeHotels(): void {
    this.hotels = [
      {
        id: 1,
        name: 'Grand Hotel Saigon',
        price: 2500000,
        address: '8 Đồng Khởi, Quận 1, TP.HCM',
        location: { lat: 10.7769, lng: 106.7009 },
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        rating: 4.5,
        isGuestFavorite: true,
        beds: '1 double bed',
        cancellation: 'Free cancellation',
        reviewCount: 127
      },
      {
        id: 2,
        name: 'Riverside Hotel',
        price: 1800000,
        address: '18 Tôn Đức Thắng, Quận 1, TP.HCM',
        location: { lat: 10.7833, lng: 106.7000 },
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
        rating: 4.2,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 89
      },
      {
        id: 3,
        name: 'Central Plaza Hotel',
        price: 3200000,
        address: '17 Lê Duẩn, Quận 1, TP.HCM',
        location: { lat: 10.7797, lng: 106.6992 },
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
        rating: 4.7,
        isGuestFavorite: true,
        beds: '2 double beds',
        cancellation: 'Free cancellation',
        reviewCount: 203
      },
      {
        id: 4,
        name: 'Boutique Hotel District 3',
        price: 1200000,
        address: '123 Võ Văn Tần, Quận 3, TP.HCM',
        location: { lat: 10.7820, lng: 106.6880 },
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        rating: 4.0,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 56
      },
      {
        id: 5,
        name: 'Business Hotel Bình Thạnh',
        price: 1500000,
        address: '456 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        location: { lat: 10.8000, lng: 106.7000 },
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
        rating: 4.3,
        beds: '1 double bed',
        cancellation: 'Free cancellation',
        reviewCount: 94
      },
      {
        id: 6,
        name: 'Luxury Resort Phú Nhuận',
        price: 4500000,
        address: '789 Nguyễn Văn Trỗi, Quận Phú Nhuận, TP.HCM',
        location: { lat: 10.7900, lng: 106.6800 },
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
        rating: 4.8,
        isGuestFavorite: true,
        beds: '2 beds',
        cancellation: 'Free cancellation',
        reviewCount: 156
      },
      {
        id: 7,
        name: 'Budget Hotel Tân Bình',
        price: 800000,
        address: '321 Cộng Hòa, Quận Tân Bình, TP.HCM',
        location: { lat: 10.8100, lng: 106.6500 },
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        rating: 3.8,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 42
      },
      {
        id: 8,
        name: 'Heritage Hotel District 5',
        price: 2200000,
        address: '567 Trần Hưng Đạo, Quận 5, TP.HCM',
        location: { lat: 10.7500, lng: 106.6600 },
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
        rating: 4.4,
        beds: '1 double bed',
        cancellation: 'Free cancellation',
        reviewCount: 78
      },
      {
        id: 9,
        name: 'Modern Apartment District 2',
        price: 2800000,
        address: '234 Nguyễn Thị Thập, Quận 7, TP.HCM',
        location: { lat: 10.7300, lng: 106.7200 },
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        rating: 4.6,
        isGuestFavorite: true,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 112
      },
      {
        id: 10,
        name: 'Cozy Studio District 10',
        price: 950000,
        address: '789 Sư Vạn Hạnh, Quận 10, TP.HCM',
        location: { lat: 10.7600, lng: 106.6700 },
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        rating: 4.1,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 67
      },
      {
        id: 11,
        name: 'Premium Hotel District 1',
        price: 3800000,
        address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
        location: { lat: 10.7750, lng: 106.7050 },
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
        rating: 4.9,
        isGuestFavorite: true,
        beds: '2 double beds',
        cancellation: 'Free cancellation',
        reviewCount: 234
      },
      {
        id: 12,
        name: 'Garden Resort District 9',
        price: 1900000,
        address: '123 Mai Chí Thọ, Quận 2, TP.HCM',
        location: { lat: 10.7800, lng: 106.7500 },
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
        rating: 4.3,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 85
      },
      {
        id: 13,
        name: 'City View Hotel District 4',
        price: 1600000,
        address: '567 Võ Văn Kiệt, Quận 4, TP.HCM',
        location: { lat: 10.7650, lng: 106.7100 },
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
        rating: 4.2,
        beds: '1 double bed',
        cancellation: 'Free cancellation',
        reviewCount: 73
      },
      {
        id: 14,
        name: 'Art Deco Hotel District 6',
        price: 1100000,
        address: '890 Hậu Giang, Quận 6, TP.HCM',
        location: { lat: 10.7450, lng: 106.6350 },
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        rating: 3.9,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 48
      },
      {
        id: 15,
        name: 'Skyline Hotel District 8',
        price: 1400000,
        address: '345 Dương Bá Trạc, Quận 8, TP.HCM',
        location: { lat: 10.7200, lng: 106.6300 },
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
        rating: 4.0,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 61
      },
      {
        id: 16,
        name: 'Riverside Apartment District 11',
        price: 1700000,
        address: '678 Lý Thường Kiệt, Quận 11, TP.HCM',
        location: { lat: 10.7550, lng: 106.6450 },
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        rating: 4.4,
        beds: '1 double bed',
        cancellation: 'Free cancellation',
        reviewCount: 92
      },
      {
        id: 17,
        name: 'Business Center Hotel District 12',
        price: 1300000,
        address: '901 Lê Văn Khương, Quận 12, TP.HCM',
        location: { lat: 10.8300, lng: 106.6200 },
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        rating: 3.7,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 35
      },
      {
        id: 18,
        name: 'Luxury Villa District 7',
        price: 5200000,
        address: '234 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
        location: { lat: 10.7400, lng: 106.7300 },
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
        rating: 4.8,
        isGuestFavorite: true,
        beds: '3 beds',
        cancellation: 'Free cancellation',
        reviewCount: 178
      },
      {
        id: 19,
        name: 'Budget Inn District 9',
        price: 750000,
        address: '567 Lê Văn Việt, Quận 9, TP.HCM',
        location: { lat: 10.8400, lng: 106.7800 },
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        rating: 3.6,
        beds: '1 bed',
        cancellation: 'Free cancellation',
        reviewCount: 29
      },
      {
        id: 20,
        name: 'Premium Resort District 2',
        price: 4100000,
        address: '789 Nguyễn Duy Trinh, Quận 9, TP.HCM',
        location: { lat: 10.8200, lng: 106.7600 },
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
        rating: 4.7,
        isGuestFavorite: true,
        beds: '2 beds',
        cancellation: 'Free cancellation',
        reviewCount: 145
      }
    ];

    this.calculateDistances();
    this.updateVisibleHotels();
  }

  // Set current location as default
  setCurrentLocationAsDefault(): void {
    this.currentLocation = {
      lat: 10.774559,
      lng: 106.675655
    };
  }

  // Calculate distances from current location
  calculateDistances(): void {
    if (!this.currentLocation) return;

    this.hotels.forEach(hotel => {
      hotel.distance = this.calculateDistance(
        this.currentLocation!.lat,
        this.currentLocation!.lng,
        hotel.location.lat,
        hotel.location.lng
      );
    });
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Update visible hotels based on zoom level and center
  updateVisibleHotels(): void {
    // Show all hotels on map, but filter visible cards based on 2km radius
    this.visibleHotels = this.hotels.filter(hotel => {
      const distance = this.calculateDistance(
        this.mapCenter.lat,
        this.mapCenter.lng,
        hotel.location.lat,
        hotel.location.lng
      );
      hotel.distance = distance;
      return distance <= 2; // 2km radius for cards only
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    console.log(this.visibleHotels);
  }

  // Get all hotels for map markers (not filtered by distance)
  getAllHotelsForMap(): Hotel[] {
    return this.hotels.map(hotel => ({
      ...hotel,
      distance: this.calculateDistance(
        this.mapCenter.lat,
        this.mapCenter.lng,
        hotel.location.lat,
        hotel.location.lng
      )
    }));
  }

  // Handle map center change
  onMapCenterChange(): void {
    // Update map center from current map state
    // this.updateVisibleHotels();
  }

  // Handle map bounds change
  onMapBoundsChange(): void {
    // This will be called when map is dragged or zoomed
    // We'll update the center and recalculate visible hotels
    // this.updateVisibleHotels();
  }

  // Handle map click
  onMapClick(event: google.maps.MapMouseEvent): void {
    console.log('🗺️ Map clicked at:', event.latLng?.lat(), event.latLng?.lng());

    if (event.latLng) {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();

      console.log('🔍 Checking all hotels...');

      console.log(clickedLat, clickedLng);



      //find hotel by clicked lat and lng
      const hotel = this.hotels.find(hotel => {
        return hotel.location.lat === clickedLat && hotel.location.lng === clickedLng;
      });

      console.log(hotel);

      if (hotel) {
        console.log('🎯 Found nearby hotel:', hotel.name);
        this.selectHotel(hotel);
      } else {
        console.log('❌ No hotel found nearby');
        // Clear selection if clicking away from markers
        this.clearSelectedHotel();
      }

      // if (nearbyHotel) {
      //   console.log('🎯 Found nearby hotel:', nearbyHotel.name);
      //   this.selectHotel(nearbyHotel);
      // } else {
      //   console.log('❌ No hotel found nearby');
      //   // Clear selection if clicking away from markers
      //   this.clearSelectedHotel();
      // }
    }
  }

  // Handle map mouseover
  onMapMouseover(event: google.maps.MapMouseEvent): void {
    console.log('🖱️ Map mouseover at:', event.latLng?.lat(), event.latLng?.lng());
  }

  // Handle map mouseout
  onMapMouseout(event: google.maps.MapMouseEvent): void {
    console.log('🖱️ Map mouseout at:', event.latLng?.lat(), event.latLng?.lng());
  }

  // Get current location
  getCurrentLocation(): void {
    this.isGettingLocation = true;
    this.locationError = '';

    if (!navigator.geolocation) {
      this.locationError = 'Trình duyệt của bạn không hỗ trợ định vị địa lý';
      this.isGettingLocation = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        this.currentLocation = location;
        this.center = { lat: location.lat, lng: location.lng };
        this.mapCenter = { lat: location.lat, lng: location.lng };
        this.zoom = 15;
        this.isGettingLocation = false;

        this.calculateDistances();
        // this.updateVisibleHotels();

        console.log('📍 Vị trí hiện tại:', location);
      },
      (error) => {
        this.isGettingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Bạn đã từ chối quyền truy cập vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Không thể xác định vị trí hiện tại';
            break;
          case error.TIMEOUT:
            this.locationError = 'Hết thời gian chờ xác định vị trí';
            break;
          default:
            this.locationError = 'Lỗi không xác định khi lấy vị trí';
            break;
        }
        console.error('❌ Lỗi lấy vị trí:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Clear current location
  clearCurrentLocation(): void {
    this.currentLocation = null;
    this.locationError = '';
  }

  // Select hotel
  selectHotel(hotel: Hotel): void {
    console.log('🏨 selectHotel called with:', hotel.name);
    this.selectedHotel = hotel;
    this.center = hotel.location;
    this.mapCenter = hotel.location;
    this.zoom = 16;
    this.showSelectedHotelInfo = true;
    // this.showDialog = true;
    this.dialogHotel = hotel;
    console.log('🏨 Selected hotel:', hotel);
    // this.updateVisibleHotels();
  }

  // Close dialog
  closeDialog(): void {
    this.showDialog = false;
    this.dialogHotel = null;
  }
  onCurrentLocationMarkerClick(): void {
    console.log('Clicked current location marker');
    // Thêm logic nếu cần, ví dụ center map lại
    this.center = { lat: this.currentLocation!.lat, lng: this.currentLocation!.lng };
  }

  // Clear selected hotel
  clearSelectedHotel(): void {
    this.selectedHotel = null;
    this.showSelectedHotelInfo = false;
  }

  // Get marker icon URL for hotels
  getHotelMarkerIconUrl(): string {
    // Giữ nguyên SVG, nhưng tăng size nếu cần (ví dụ width/height=32)
    const svg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V22H22V7L12 2Z" fill="#FF6B35" stroke="white" stroke-width="2"/>
        <path d="M9 14H15V22H9V14Z" fill="white"/>
        <circle cx="12" cy="10" r="2" fill="white"/>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  // Get marker options for hotels
  getHotelMarkerOptions(): google.maps.MarkerOptions {
    return {
      icon: {
        url: this.getHotelMarkerIconUrl(),
      },
      clickable: true  // Explicitly set để nhận click
    };
  }

  // Get marker icon URL for current location
  getMarkerIconUrl(): string {
    const svg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  // Get marker options for current location
  getMarkerOptions(): google.maps.MarkerOptions {
    return {
      icon: {
        url: this.getMarkerIconUrl()
      },
      clickable: true
    };
  }

  // Get current location as LatLngLiteral
  getCurrentLocationAsLatLng(): google.maps.LatLngLiteral | null {
    return this.currentLocation ? { lat: this.currentLocation.lat, lng: this.currentLocation.lng } : null;
  }

  // Format price
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Get price marker icon URL (AirBnB style)
  getPriceMarkerIconUrl(hotel: Hotel): string {
    const isSelected = this.selectedHotel?.id === hotel.id;
    const backgroundColor = isSelected ? '#222222' : '#ffffff';
    const textColor = isSelected ? '#ffffff' : '#222222';
    const borderColor = isSelected ? '#222222' : '#dddddd';

    const svg = `
      <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="32" rx="16" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="1"/>
        <text x="40" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="${textColor}">
          ₫${(hotel.price / 1000).toFixed(0)}k
        </text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  // Get price marker options
  getPriceMarkerOptions(hotel: Hotel): google.maps.MarkerOptions {
    return {
      icon: {
        url: this.getPriceMarkerIconUrl(hotel)
      }
    };
  }

  onMapReady(): void {
    this.isMapReady = true;
    console.log('🗺️ Map is fully ready!');
    // Nếu cần, add listener động hoặc recalculate gì đó
  }
}
