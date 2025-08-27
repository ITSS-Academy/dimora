import {Component, ViewChild} from '@angular/core';
import {MapComponent} from '../../shared/components/map/map.component';
import {DecimalPipe} from '@angular/common';
import {GoogleMap, MapMarker} from '@angular/google-maps';
import {RoomModel} from '../../models/room.model';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
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
  
  // Map options for smooth performance
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
    disableDefaultUI: false,
    gestureHandling: 'greedy', // Smooth gesture handling
    isFractionalZoomEnabled: true, // Smooth zoom transitions
    minZoom: 10,
    maxZoom: 18,
    // Performance optimizations
    backgroundColor: '#f8f9fa',
    clickableIcons: true,
    draggableCursor: 'grab',
    draggingCursor: 'grabbing',
    // Map styling for better performance
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  // Current location
  currentLocation: Location | null = null;
  isGettingLocation = false;
  locationError = '';

  // Rooms
  rooms: RoomModel[] = [];
  selectedRoom: RoomModel | null = null;
  visibleRooms: RoomModel[] = [];
  mapCenter: google.maps.LatLngLiteral = { lat: 10.774559, lng: 106.675655 };
  showSelectedRoomInfo: boolean = false;
  showDialog: boolean = false;
  dialogRoom: RoomModel | null = null;

  constructor() {}

  ngOnInit() {
    console.log('🚀 App component initialized');
    this.initializeRooms();
    this.setCurrentLocationAsDefault();

    // Debug map after view init
    setTimeout(() => {
      console.log('🗺️ Map instance:', this.map);
      if (this.map) {
        console.log('🗺️ Map is ready');
      }
    }, 1000);
  }

  // Initialize rooms data
  initializeRooms(): void {
    this.rooms = [
      {
        id: '1',
        title: 'Grand Hotel Saigon Room',
        description: 'Luxury room with city view in the heart of District 1',
        price_per_night: 2500000,
        location: 'Quận 1, TP.HCM',
        address: '8 Đồng Khởi, Quận 1, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7769,
        longitude: 106.7009,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'luxury',
        amenities: ['WiFi', 'Điều hòa', 'Bếp', 'TV', 'Tủ lạnh'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'],
        host_id: 'host1',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Riverside Hotel Room',
        description: 'Cozy room with river view',
        price_per_night: 1800000,
        location: 'Quận 1, TP.HCM',
        address: '18 Tôn Đức Thắng, Quận 1, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7833,
        longitude: 106.7000,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'standard',
        amenities: ['WiFi', 'Điều hòa', 'TV'],
        images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop'],
        host_id: 'host2',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        title: 'Central Plaza Hotel Suite',
        description: 'Spacious suite with premium amenities',
        price_per_night: 3200000,
        location: 'Quận 1, TP.HCM',
        address: '17 Lê Duẩn, Quận 1, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7797,
        longitude: 106.6992,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        room_type_id: 'suite',
        amenities: ['WiFi', 'Điều hòa', 'Bếp', 'TV', 'Tủ lạnh', 'Máy giặt'],
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop'],
        host_id: 'host3',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        title: 'Boutique Hotel District 3',
        description: 'Charming boutique hotel room',
        price_per_night: 1200000,
        location: 'Quận 3, TP.HCM',
        address: '123 Võ Văn Tần, Quận 3, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7820,
        longitude: 106.6880,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'boutique',
        amenities: ['WiFi', 'Điều hòa', 'TV', 'Bếp nhỏ'],
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
        host_id: 'host4',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        title: 'Business Hotel Bình Thạnh',
        description: 'Perfect for business travelers',
        price_per_night: 1500000,
        location: 'Quận Bình Thạnh, TP.HCM',
        address: '456 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.8000,
        longitude: 106.7000,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'business',
        amenities: ['WiFi', 'Điều hòa', 'TV', 'Bàn làm việc'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop'],
        host_id: 'host5',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        title: 'Luxury Resort Phú Nhuận',
        description: 'Luxury resort experience in the city',
        price_per_night: 4500000,
        location: 'Quận Phú Nhuận, TP.HCM',
        address: '789 Nguyễn Văn Trỗi, Quận Phú Nhuận, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7900,
        longitude: 106.6800,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        room_type_id: 'luxury',
        amenities: ['WiFi', 'Điều hòa', 'Bếp', 'TV', 'Tủ lạnh', 'Hồ bơi', 'Gym'],
        images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop'],
        host_id: 'host6',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        title: 'Budget Hotel Tân Bình',
        description: 'Affordable accommodation option',
        price_per_night: 800000,
        location: 'Quận Tân Bình, TP.HCM',
        address: '321 Cộng Hòa, Quận Tân Bình, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.8100,
        longitude: 106.6500,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'budget',
        amenities: ['WiFi', 'Điều hòa', 'TV'],
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'],
        host_id: 'host7',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '8',
        title: 'Heritage Hotel District 5',
        description: 'Historic hotel with modern comfort',
        price_per_night: 2200000,
        location: 'Quận 5, TP.HCM',
        address: '567 Trần Hưng Đạo, Quận 5, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7500,
        longitude: 106.6600,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'heritage',
        amenities: ['WiFi', 'Điều hòa', 'TV', 'Bếp'],
        images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop'],
        host_id: 'host8',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '9',
        title: 'Modern Apartment District 7',
        description: 'Modern apartment with full amenities',
        price_per_night: 2800000,
        location: 'Quận 7, TP.HCM',
        address: '234 Nguyễn Thị Thập, Quận 7, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7300,
        longitude: 106.7200,
        max_guests: 3,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'apartment',
        amenities: ['WiFi', 'Điều hòa', 'Bếp', 'TV', 'Tủ lạnh', 'Máy giặt'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
        host_id: 'host9',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '10',
        title: 'Cozy Studio District 10',
        description: 'Cozy studio perfect for solo travelers',
        price_per_night: 950000,
        location: 'Quận 10, TP.HCM',
        address: '789 Sư Vạn Hạnh, Quận 10, TP.HCM',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        latitude: 10.7600,
        longitude: 106.6700,
        max_guests: 1,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        room_type_id: 'studio',
        amenities: ['WiFi', 'Điều hòa', 'TV', 'Bếp nhỏ'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'],
        host_id: 'host10',
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    this.calculateDistances();
    this.updateVisibleRooms();
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

    this.rooms.forEach(room => {
      // Add distance property to room (not in original model, but needed for UI)
      (room as any).distance = this.calculateDistance(
        this.currentLocation!.lat,
        this.currentLocation!.lng,
        room.latitude,
        room.longitude
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

  // Update visible rooms based on zoom level and center
  updateVisibleRooms(): void {
    // Show all rooms without distance filtering
    this.visibleRooms = this.rooms.map(room => {
      const distance = this.calculateDistance(
        this.mapCenter.lat,
        this.mapCenter.lng,
        room.latitude,
        room.longitude
      );
      (room as any).distance = distance;
      return room;
    }).sort((a, b) => ((a as any).distance || 0) - ((b as any).distance || 0));
    console.log(this.visibleRooms);
  }

  // Get all rooms for map markers (not filtered by distance)
  getAllRoomsForMap(): RoomModel[] {
    return this.rooms.map(room => ({
      ...room,
      distance: this.calculateDistance(
        this.mapCenter.lat,
        this.mapCenter.lng,
        room.latitude,
        room.longitude
      )
    }));
  }

  // Handle map center change
  onMapCenterChange(): void {
    // Update map center from current map state
    // this.updateVisibleRooms();
  }

  // Handle map bounds change
  onMapBoundsChange(): void {
    // This will be called when map is dragged or zoomed
    // We'll update the center and recalculate visible rooms
    // this.updateVisibleRooms();
  }

  // Handle map click
  onMapClick(event: google.maps.MapMouseEvent): void {
    console.log('🗺️ Map clicked at:', event.latLng?.lat(), event.latLng?.lng());

    if (event.latLng) {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();

      console.log('🔍 Checking all rooms...');

      console.log(clickedLat, clickedLng);

      //find room by clicked lat and lng
      const room = this.rooms.find(room => {
        return room.latitude === clickedLat && room.longitude === clickedLng;
      });

      console.log(room);

      if (room) {
        console.log('🎯 Found nearby room:', room.title);
        this.selectRoom(room);
      } else {
        console.log('❌ No room found nearby');
        // Clear selection if clicking away from markers
        this.clearSelectedRoom();
      }
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
        // this.updateVisibleRooms();

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

  // Select room
  selectRoom(room: RoomModel): void {
    console.log('🏨 selectRoom called with:', room.title);
    this.selectedRoom = room;
    
    // Smooth zoom animation to selected room
    this.smoothZoomToRoom(room);
    
    this.showSelectedRoomInfo = true;
    // this.showDialog = true;
    this.dialogRoom = room;
    console.log('🏨 Selected room:', room);
    // this.updateVisibleRooms();
  }

  // Smooth zoom animation to room
  smoothZoomToRoom(room: RoomModel): void {
    const targetCenter = { lat: room.latitude, lng: room.longitude };
    const targetZoom = 16;
    
    // Calculate distance between current and target
    const distance = this.calculateDistance(
      this.center.lat,
      this.center.lng,
      targetCenter.lat,
      targetCenter.lng
    );
    
    // If distance is too small, just jump directly without animation
    if (distance < 0.5) { // Less than 500 meters
      this.center = targetCenter;
      this.zoom = targetZoom;
      this.mapCenter = targetCenter;
      return;
    }
    
    // If zoom level is similar, just pan without zoom animation
    const zoomDiff = Math.abs(this.zoom - targetZoom);
    if (zoomDiff < 2) {
      this.smoothPanToRoom(room);
      return;
    }
    
    const duration = 800; // Shorter duration
    const steps = 40; // Fewer steps
    const stepDuration = duration / steps;
    
    const startCenter = { ...this.center };
    const startZoom = this.zoom;
    
    let currentStep = 0;
    
    // Simpler easing function for smoother animation
    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };
    
    const animate = () => {
      if (currentStep < steps) {
        const progress = currentStep / steps;
        const easedProgress = easeOutQuart(progress);
        
        this.center = {
          lat: startCenter.lat + (targetCenter.lat - startCenter.lat) * easedProgress,
          lng: startCenter.lng + (targetCenter.lng - startCenter.lng) * easedProgress
        };
        this.zoom = startZoom + (targetZoom - startZoom) * easedProgress;
        this.mapCenter = { ...this.center };
        
        currentStep++;
        setTimeout(animate, stepDuration);
      } else {
        // Ensure final position is exact
        this.center = targetCenter;
        this.zoom = targetZoom;
        this.mapCenter = targetCenter;
      }
    };
    
    animate();
  }

  // Smooth pan animation (no zoom)
  smoothPanToRoom(room: RoomModel): void {
    const targetCenter = { lat: room.latitude, lng: room.longitude };
    const duration = 400; // Very short for nearby locations
    const steps = 20;
    const stepDuration = duration / steps;
    
    const startCenter = { ...this.center };
    
    let currentStep = 0;
    
    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };
    
    const animate = () => {
      if (currentStep < steps) {
        const progress = currentStep / steps;
        const easedProgress = easeOutQuart(progress);
        
        this.center = {
          lat: startCenter.lat + (targetCenter.lat - startCenter.lat) * easedProgress,
          lng: startCenter.lng + (targetCenter.lng - startCenter.lng) * easedProgress
        };
        this.mapCenter = { ...this.center };
        
        currentStep++;
        setTimeout(animate, stepDuration);
      } else {
        this.center = targetCenter;
        this.mapCenter = targetCenter;
      }
    };
    
    animate();
  }

  // Close dialog
  closeDialog(): void {
    this.showDialog = false;
    this.dialogRoom = null;
  }
  
  onCurrentLocationMarkerClick(): void {
    console.log('Clicked current location marker');
    // Thêm logic nếu cần, ví dụ center map lại
    this.center = { lat: this.currentLocation!.lat, lng: this.currentLocation!.lng };
  }

  // Clear selected room
  clearSelectedRoom(): void {
    this.selectedRoom = null;
    this.showSelectedRoomInfo = false;
  }

  // Get marker icon URL for rooms
  getRoomMarkerIconUrl(): string {
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

  // Get marker options for rooms
  getRoomMarkerOptions(): google.maps.MarkerOptions {
    return {
      icon: {
        url: this.getRoomMarkerIconUrl(),
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
  getPriceMarkerIconUrl(room: RoomModel): string {
    const isSelected = this.selectedRoom?.id === room.id;
    const backgroundColor = isSelected ? '#222222' : '#ffffff';
    const textColor = isSelected ? '#ffffff' : '#222222';
    const borderColor = isSelected ? '#222222' : '#dddddd';

    const svg = `
      <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="32" rx="16" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="1"/>
        <text x="40" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="${textColor}">
          ₫${(room.price_per_night / 1000).toFixed(0)}k
        </text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  // Get price marker options
  getPriceMarkerOptions(room: RoomModel): google.maps.MarkerOptions {
    return {
      icon: {
        url: this.getPriceMarkerIconUrl(room)
      }
    };
  }

  onMapReady(): void {
    this.isMapReady = true;
    console.log('🗺️ Map is fully ready!');
    // Nếu cần, add listener động hoặc recalculate gì đó
  }

  // Get room distance for template
  getRoomDistance(room: RoomModel): number | null {
    if (!this.currentLocation) return null;
    return this.calculateDistance(
      this.currentLocation.lat,
      this.currentLocation.lng,
      room.latitude,
      room.longitude
    );
  }
}
