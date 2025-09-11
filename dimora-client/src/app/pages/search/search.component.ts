import {Component, ViewChild} from '@angular/core';
import {MapComponent} from '../../shared/components/map/map.component';
import {DecimalPipe} from '@angular/common';
import {GoogleMap, MapMarker} from '@angular/google-maps';
import {RoomModel} from '../../models/room.model';
import { SearchState } from '../../ngrx/state/search.state';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { LoadingComponent } from "../../shared/components/loading/loading.component";
import { ActivatedRoute, Router } from '@angular/router';
import { SearchModel } from '../../models/search.model';
import * as SearchActions from '../../ngrx/actions/search.actions';
import { MaterialModule } from '../../shared/material.module';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

@Component({
  selector: 'app-search',
  imports: [
    GoogleMap,
    MapMarker,
    AsyncPipe,
    LoadingComponent,
    MaterialModule
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
  isLoading$!:Observable<boolean>
  
  // Map options for smooth performance
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    center: this.center,
    
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    disableDefaultUI: false,
    gestureHandling: 'greedy', // Smooth gesture handling
    isFractionalZoomEnabled: true, // Smooth zoom transitions
    minZoom: 1,
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
  searchResult$ !: Observable<RoomModel[]>;
  subscriptions: Subscription[] = [];

  constructor(
    private store: Store<{
    search: SearchState,
  }>,
  private route: ActivatedRoute,
  private router: Router
) {
  this.searchResult$ = this.store.select('search','searchRooms');
  this.isLoading$ = this.store.select('search','isLoading');
  }

  ngOnInit() {
    console.log('🚀 App component initialized');
    this.setCurrentLocationAsDefault();

    // Handle query parameters
    this.handleQueryParameters();

    // Subscribe to search results from API
    this.subscriptions.push(
      this.searchResult$.subscribe(result => {
        if(result && result.length > 0){
          this.rooms = result;
          this.center = { lat: this.rooms[0].latitude, lng: this.rooms[0].longitude };
          this.updateVisibleRooms();
        } else {
          this.rooms = [];
          this.visibleRooms = [];
        }
      })
    );


  }
 

  // Set current location as default
  setCurrentLocationAsDefault(): void {
    this.currentLocation = {
      lat: 10.774559,
      lng: 106.675655
    };
  }

  // Calculate distances from current location - removed


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

  // Update visible rooms - show all rooms
  updateVisibleRooms(): void {
    // Show all rooms without distance calculation
    this.visibleRooms = [...this.rooms];
  }

  // Get all rooms for map markers
  getAllRoomsForMap(): RoomModel[] {
    return [...this.rooms];
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

  // Zoom to current location with smooth animation
  zoomToMyLocation(): void {
    if (this.currentLocation) {
      // If we already have location, just zoom to it
      this.mapOptions.center = { lat: this.currentLocation.lat, lng: this.currentLocation.lng };
    } 
  }

  // Smooth zoom to specific location
  // smoothZoomToLocation(targetLocation: Location): void {
  //   const targetCenter = { lat: targetLocation.lat, lng: targetLocation.lng };
  //   const targetZoom = 15;
  //   const duration = 800;
  //   const steps = 40;
  //   const stepDuration = duration / steps;
    
  //   const startCenter = { ...this.center };
  //   const startZoom = this.zoom;
    
  //   let currentStep = 0;
    
  //   const easeOutQuart = (t: number): number => {
  //     return 1 - Math.pow(1 - t, 4);
  //   };
    
  //   const animate = () => {
  //     if (currentStep < steps) {
  //       const progress = currentStep / steps;
  //       const easedProgress = easeOutQuart(progress);
        
  //       this.center = {
  //         lat: startCenter.lat + (targetCenter.lat - startCenter.lat) * easedProgress,
  //         lng: startCenter.lng + (targetCenter.lng - startCenter.lng) * easedProgress
  //       };
  //       this.zoom = startZoom + (targetZoom - startZoom) * easedProgress;
  //       this.mapCenter = { ...this.center };
        
  //       currentStep++;
  //       setTimeout(animate, stepDuration);
  //     } else {
  //       this.center = targetCenter;
  //       this.zoom = targetZoom;
  //       this.mapCenter = targetCenter;
  //     }
  //   };
    
  //   animate();
  // }

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

  // Get room distance for template - removed
  getRoomDistance(room: RoomModel): number | null {
    // Distance calculation removed - no longer needed
    return null;
  }

  // Handle query parameters from URL
  handleQueryParameters(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        console.log('Query parameters:', params);
        
        if (Object.keys(params).length > 0) {
          // Create search model from query parameters
          const searchData: SearchModel = {
            location: params['location'] || '',
            checkIn: params['checkIn'] || '',
            checkOut: params['checkOut'] || '',
            guests: Number(params['guests']) || 1,
            minPrice: Number(params['minPrice']) || 0,
            maxPrice: Number(params['maxPrice']) || 0,
            radius: Number(params['radius']) || 0
          };

          console.log('Search data from query params:', searchData);
          
          // Dispatch search action if we have location
          if (searchData.location) {
            this.store.dispatch(SearchActions.searchRooms({ searchParams: searchData }));
          }
        }
      })
    );
  }

  // Update URL with current search parameters
  updateUrlWithSearchParams(searchParams: SearchModel): void {
    const queryParams = {
      location: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      radius: searchParams.radius
    };

    // Remove empty values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key as keyof typeof queryParams] === '' || 
          queryParams[key as keyof typeof queryParams] === 0) {
        delete queryParams[key as keyof typeof queryParams];
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  // Navigate to detail page
  navigateToDetail(roomId: string, event: Event): void {
    event.stopPropagation(); // Prevent card click event
    
    // Find the room to get host_id
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      this.router.navigate(['/detail', roomId], {
        queryParams: {
          hostId: room.host_id
        }
      });
    } else {
      console.error('Room not found:', roomId);
    }
  }

  // Cleanup subscriptions when component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('Search component destroyed, subscriptions cleaned up');
  }
}
