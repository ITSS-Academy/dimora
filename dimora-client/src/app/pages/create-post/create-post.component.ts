import { Component, inject, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ShareModule } from '../../shared/share.module';
import { RoomModel } from '../../models/room.model';
import { Store } from '@ngrx/store';
import * as RoomActions from '../../ngrx/actions/room.actions';
import { RoomState } from '../../ngrx/state/room.state';
import { AuthState } from '../../ngrx/state/auth.state';
import { Observable, Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { GoogleMap, MapGeocoder, MapMarker } from "@angular/google-maps";
import { AmenitiesState } from '../../ngrx/state/amenities.state';
import { AmenitiesModel } from '../../models/amenities.model';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { RoomTypeModel } from '../../models/room_type.model';
import { RoomTypesState } from '../../ngrx/state/room-types.state';
import { Router } from '@angular/router';
import { AuthModel } from '../../models/auth.model';

@Component({
  selector: 'app-create-post',
  imports: [MaterialModule, ShareModule, GoogleMap, MapMarker],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss',
})
export class CreatePostComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  token$ !: Observable<string>
  amenities$ !: Observable<AmenitiesModel[]>
  subscriptions: Subscription[] = []
  roomTypes$ !: Observable<RoomTypeModel[]>
  idToken: string = ''
  isCreateRoom$ !: Observable<boolean>
  mineProfile$ !: Observable<AuthModel>
  mineProfile: AuthModel = <AuthModel>{};
  constructor(
    private router: Router,
    private store: Store<{
      room: RoomState,
      auth: AuthState,
      amenities: AmenitiesState,
      roomTypes: RoomTypesState
    }>,
    private geocoder: MapGeocoder,
    private snackBar: SnackbarService
  ){
    this.token$ = this.store.select('auth', 'idToken')
    this.amenities$ = this.store.select('amenities', 'amenities')
    this.roomTypes$ = this.store.select('roomTypes', 'roomTypes')
    this.isCreateRoom$ = this.store.select('room', 'isCreatingRoom')
    this.mineProfile$ = this.store.select('auth', 'mineProfile')
  }

  ngOnInit(): void {
    // Add document click listener to maintain stepper focus
    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.subscriptions.push(

      this.isCreateRoom$.subscribe(isCreateRoom => {
        if (isCreateRoom) {
          this.snackBar.showAlert('Room created successfully', 'Close', 3000)
          this.store.dispatch(RoomActions.clearCreateRoomState())
          // this.router.navigate(['/profile', this.mineProfile.id])
        }
      }),
      this.token$.subscribe(token => {
        this.idToken = token
      }),
      this.mineProfile$.subscribe(mineProfile => {
        if (mineProfile.id) {
          this.mineProfile = mineProfile
        }
      })
    )



  }

  ngOnDestroy(): void {
    // Remove document click listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    // Component initialized
  }

  @HostListener('document:click', ['$event'])
  onDocumentClickHandler(event: Event): void {
    this.onDocumentClick(event);
  }

  // Single unified form for all steps
  roomForm = new FormGroup({
    // Step 1 - Basic info

    // Step 2 - Room type
    propertyType: new FormControl(''),
    room_type_id: new FormControl('', Validators.required),

    // Step 3 - Capacity
    guests: new FormControl(0, [Validators.required, Validators.min(0)]),
    bedrooms: new FormControl(0, [Validators.required, Validators.min(0)]),
    beds: new FormControl(0, [Validators.required, Validators.min(0)]),
    bathrooms: new FormControl(0, [Validators.required, Validators.min(0)]),

    // Step 4 - Location (placeholder)

    // Step 5 - Amenities
    amenities: new FormControl<string[]>([], Validators.required),

    // Step 6 - Photos (placeholder)
    photos: new FormControl<File[]>([], Validators.required),

    // Step 7 - Confirm photos
    confirmPhotos: new FormControl<File[]>([], [Validators.required, Validators.minLength(5)]),

    // Step 8 - Title
    title: new FormControl('', [Validators.required, Validators.maxLength(50)]),

    // Step 9 - Highlights

    // Step 10 - Price
    basePrice: new FormControl(null, [Validators.required, Validators.min(50000)]),

    // Additional fields for room creation
    description: new FormControl('', [Validators.required, Validators.minLength(50)]),
    address: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    country: new FormControl('Việt Nam', Validators.required),
    latitude: new FormControl(0, Validators.required),
    longitude: new FormControl(0, Validators.required),
    max_guests: new FormControl(0, [Validators.required, Validators.min(1)]),
    price_per_night: new FormControl(0, [Validators.required, Validators.min(50000)]),
    images: new FormControl<string[]>([], [Validators.required, Validators.minLength(5)]),
    is_available: new FormControl(true)
  });

  // UI state variables
  selectedType: string = '';
  selectedRoomTypeId: string = '';
  selectedAmenities: string[] = [];
  selectedOptions: string[] = [];
  previewUrls: string[] = [];
  taxRate = 0.14;
  guestPrice = 0;

  // Drag & drop variables
  draggedIndex: number | null = null;

  // Step navigation control
  currentStepIndex = 0;
  completedSteps: number[] = [];
  isNavigating = false;
  isManualClick = false;

  // Location data
  cities = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
  ];

  districts: { [key: string]: string[] } = {
    'Hồ Chí Minh': [
      'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
      'Quận 11', 'Quận 12', 'Quận Thủ Đức', 'Quận Gò Vấp', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Tân Phú',
      'Quận Phú Nhuận', 'Quận Bình Tân', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Bình Chánh', 'Huyện Nhà Bè', 'Huyện Cần Giờ'
    ],
    'Hà Nội': [
      'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên', 'Quận Cầu Giấy', 'Quận Đống Đa',
      'Quận Hai Bà Trưng', 'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Huyện Sóc Sơn', 'Huyện Đông Anh', 'Huyện Gia Lâm',
      'Quận Nam Từ Liêm', 'Huyện Thanh Trì', 'Quận Bắc Từ Liêm', 'Huyện Mê Linh', 'Huyện Hà Đông', 'Quận Hà Đông',
      'Thị xã Sơn Tây', 'Huyện Ba Vì', 'Huyện Phúc Thọ', 'Huyện Đan Phượng', 'Huyện Hoài Đức', 'Huyện Quốc Oai',
      'Huyện Thạch Thất', 'Huyện Chương Mỹ', 'Huyện Thanh Oai', 'Huyện Thường Tín', 'Huyện Phú Xuyên', 'Huyện Ứng Hòa',
      'Huyện Mỹ Đức'
    ],
    'Đà Nẵng': [
      'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ',
      'Huyện Hòa Vang', 'Huyện Hoàng Sa'
    ],
    'Cần Thơ': [
      'Quận Ninh Kiều', 'Quận Ô Môn', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Thốt Nốt', 'Huyện Vĩnh Thạnh',
      'Huyện Cờ Đỏ', 'Huyện Phong Điền', 'Huyện Thới Lai'
    ],
    'Hải Phòng': [
      'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An', 'Quận Đồ Sơn',
      'Quận Dương Kinh', 'Huyện Thuỷ Nguyên', 'Huyện An Dương', 'Huyện An Lão', 'Huyện Kiến Thuỵ', 'Huyện Tiên Lãng',
      'Huyện Vĩnh Bảo', 'Huyện Cát Hải', 'Huyện Bạch Long Vĩ'
    ]
  };

  availableDistricts: string[] = [];
  selectedCity = '';
  selectedDistrict = '';

  // Google Maps
  mapCenter: google.maps.LatLngLiteral = { lat: 10.8231, lng: 106.6297 }; // Hồ Chí Minh
  mapZoom = 12;
  markerPosition: google.maps.LatLngLiteral | null = null;

  // Step methods
  selectType(type: string) {
    this.selectedType = type;
    this.roomForm.get('propertyType')?.setValue(type);
  }

  // Room type selection method
  onRoomTypeSelected(roomTypeId: string) {
    // Chỉ được chọn 1 room type
    this.roomForm.get('room_type_id')?.setValue(roomTypeId);
    this.selectedRoomTypeId = roomTypeId;
  }

  // Check if room type is selected
  isRoomTypeSelected(roomTypeId: string): boolean {
    return this.selectedRoomTypeId === roomTypeId;
  }

  increase(controlName: string) {
    const control = this.roomForm.get(controlName);
    if (control) {
      const newValue = (control.value || 0) + 1;
      control.setValue(newValue);
    }
  }

  decrease(controlName: string) {
    const control = this.roomForm.get(controlName);
    if (control && control.value > 0) {
      const newValue = control.value - 1;
      control.setValue(newValue);
    }
  }

  canGoNextFromThird(): boolean {
    const guests = this.roomForm.get('guests')?.value || 0;
    const bedrooms = this.roomForm.get('bedrooms')?.value || 0;
    const beds = this.roomForm.get('beds')?.value || 0;
    const bathrooms = this.roomForm.get('bathrooms')?.value || 0;
    return guests > 0 || bedrooms > 0 || beds > 0 || bathrooms > 0;
  }

  toggleAmenity(amenity: string) {
    const amenities = this.roomForm.get('amenities')?.value || [];
    let updated = [];
    if (amenities.includes(amenity)) {
      updated = amenities.filter((a: string) => a !== amenity);
    } else {
      updated = [...amenities, amenity];
    }
    this.roomForm.get('amenities')?.setValue(updated);
    this.selectedAmenities = updated;
  }

  // New method to toggle amenity by ID
  toggleAmenityById(amenityId: string) {
    const amenities = this.roomForm.get('amenities')?.value || [];
    let updated = [];
    if (amenities.includes(amenityId)) {
      updated = amenities.filter((a: string) => a !== amenityId);
    } else {
      updated = [...amenities, amenityId];
    }
    this.roomForm.get('amenities')?.setValue(updated);
    this.selectedAmenities = updated;
  }

  isAmenitySelected(amenityId: string): boolean {
    const amenities = this.roomForm.get('amenities')?.value || [];
    return amenities.includes(amenityId);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    const currentFiles: File[] = this.roomForm.get('photos')?.value || [];
    const updatedFiles = [...currentFiles, ...newFiles];

    // Cập nhật cả photos và confirmPhotos
    this.roomForm.get('photos')?.setValue(updatedFiles);
    this.roomForm.get('confirmPhotos')?.setValue(updatedFiles);

    // Sử dụng method updatePreviewUrls để cập nhật preview
    this.updatePreviewUrls(updatedFiles);

  }

  removeImage(index: number): void {
    const currentFiles: File[] = this.roomForm.get('photos')?.value || [];
    currentFiles.splice(index, 1);

    // Cập nhật cả photos và confirmPhotos
    this.roomForm.get('photos')?.setValue(currentFiles);
    this.roomForm.get('confirmPhotos')?.setValue(currentFiles);

    // Sử dụng method updatePreviewUrls để cập nhật preview
    this.updatePreviewUrls(currentFiles);

  }

  canGoToStepEight(): boolean {
    const photos = this.roomForm.get('photos')?.value || [];
    return photos.length >= 5;
  }

  canGoToStepNine(): boolean {
    const title = this.roomForm.get('title')?.value || '';
    const description = this.roomForm.get('description')?.value || '';
    return title.length > 0 && description.length > 0;
  }

  canGoToStepTen(): boolean {
    const address = this.roomForm.get('address')?.value || '';
    const city = this.roomForm.get('city')?.value || '';
    const location = this.roomForm.get('location')?.value || '';
    return address.length > 0 && city.length > 0 && location.length > 0;
  }

  isLastStep(): boolean {
    return this.currentStepIndex === 9; // Step 10 (index 9) is the last step
  }



  // Location methods
  onCityChange(city: string): void {
    this.selectedCity = city;
    this.roomForm.get('city')?.setValue(city);

    // Update available districts based on selected city
    this.availableDistricts = this.districts[city] || [];

    // Reset district selection
    this.selectedDistrict = '';
    this.roomForm.get('location')?.setValue('');

    // Enable/disable location field based on available districts
    if (this.availableDistricts.length === 0) {
      this.roomForm.get('location')?.disable();
    } else {
      this.roomForm.get('location')?.enable();
    }
  }

  onDistrictChange(district: string): void {
    this.selectedDistrict = district;
    this.roomForm.get('location')?.setValue(district);
    this.searchAddress();
  }

  onAddressEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchAddress();
  }

  onSelectEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // For select fields, just prevent default behavior
    // The selectionChange event will handle the search
  }

  // Search and geocoding methods
  searchAddress(): void {
    const address = this.roomForm.get('address')?.value || '';
    const city = this.roomForm.get('city')?.value || '';
    const location = this.roomForm.get('location')?.value || '';

    if (address && city && location) {
      const fullAddress = `${address}, ${location}, ${city}, Việt Nam`;
      this.geocodeAddress(fullAddress);
    }
  }

  geocodeAddress(address: string): void {
    this.geocoder.geocode({ address: address }).subscribe(({ results }) => {
      if (results && results.length > 0) {
        const location = results[0].geometry.location;
        this.markerPosition = { lat: location.lat(), lng: location.lng() };
        this.mapCenter = this.markerPosition;
        this.mapZoom = 15;

        // Update coordinates in form
        this.roomForm.get('latitude')?.setValue(location.lat());
        this.roomForm.get('longitude')?.setValue(location.lng());
      }
    });
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.reverseGeocode(event.latLng);
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.reverseGeocode(event.latLng);
    }
  }

  reverseGeocode(latLng: google.maps.LatLng): void {
    this.geocoder.geocode({ location: latLng }).subscribe(({ results }) => {
      if (results && results.length > 0) {
        const result = results[0];
        this.parseAddressComponents(result.address_components);

        // Update coordinates in form
        this.roomForm.get('latitude')?.setValue(latLng.lat());
        this.roomForm.get('longitude')?.setValue(latLng.lng());
      }
    });
  }

  parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): void {
    let address = '';
    let city = '';
    let district = '';

    components.forEach(component => {
      const types = component.types;

      if (types.includes('street_number') || types.includes('route')) {
        address = component.long_name + ' ' + address;
      }

      if (types.includes('administrative_area_level_1')) {
        city = component.long_name;
      }

      if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      }
    });

    // Update form values
    if (address.trim()) {
      this.roomForm.get('address')?.setValue(address.trim());
    }

    if (city && this.cities.includes(city)) {
      this.onCityChange(city);
    }

    if (district && this.availableDistricts.includes(district)) {
      this.onDistrictChange(district);
    }
  }


  // Step navigation control methods
  isStepCompleted(stepIndex: number): boolean {
    return this.completedSteps.includes(stepIndex);
  }

  isStepAccessible(stepIndex: number): boolean {
    // Step 0 is always accessible
    if (stepIndex === 0) return true;

    // Allow access to all previous steps (back navigation)
    if (stepIndex < this.currentStepIndex) return true;

    // For forward navigation, previous step must be completed
    return this.isStepCompleted(stepIndex - 1);
  }

  canNavigateToStep(stepIndex: number): boolean {
    return this.isStepAccessible(stepIndex);
  }

  onStepChange(event: any): void {
    const targetStepIndex = event.selectedIndex;

    // Allow back navigation (going to previous steps)
    if (targetStepIndex < this.currentStepIndex) {
      this.currentStepIndex = targetStepIndex;
      this.isManualClick = false;
      return;
    }

    // Only prevent forward navigation if it's a manual click on step header
    // Allow programmatic navigation (like Next button)
    if (!this.canNavigateToStep(targetStepIndex) && this.isManualClick) {
      // Set navigating flag to prevent infinite loops
      this.isNavigating = true;

      // Reset to current step using ViewChild reference
      setTimeout(() => {
        try {
          if (this.stepper && this.stepper.selectedIndex !== this.currentStepIndex) {
            this.stepper.selectedIndex = this.currentStepIndex;
          }
        } catch (error) {
          console.warn('Could not reset stepper index:', error);
        } finally {
          // Reset navigating flag after a short delay
          setTimeout(() => {
            this.isNavigating = false;
            this.isManualClick = false;
          }, 100);
        }
      }, 0);
      return;
    }

    this.currentStepIndex = targetStepIndex;
    this.isManualClick = false;
  }

  markStepAsCompleted(stepIndex: number): void {
    if (!this.completedSteps.includes(stepIndex)) {
      this.completedSteps.push(stepIndex);
    }
  }

  onStepCompleted(stepIndex: number): void {
    this.markStepAsCompleted(stepIndex);
    // Allow navigation to next step - this is programmatic navigation
    this.isNavigating = true;
    this.isManualClick = false; // Ensure this is not treated as manual click
    setTimeout(() => {
      this.isNavigating = false;
    }, 200);
  }

  // Method to check if step header should be clickable
  isStepClickable(stepIndex: number): boolean {
    return this.isStepAccessible(stepIndex);
  }

  // Prevent accidental navigation when clicking outside
  onStepperClick(event: Event): void {
    // Prevent event bubbling to avoid losing focus
    event.stopPropagation();
  }

  // Handle manual click on step header
  onStepHeaderClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Check if click is on step header (not content)
    if (target.closest('.mat-step-header')) {
      this.isManualClick = true;
    }
  }

  // Handle clicks inside step content
  onStepContentClick(event: Event): void {
    // Allow clicks inside step content without affecting stepper focus
    event.stopPropagation();
    // Reset manual click flag since this is content click, not header click
    this.isManualClick = false;
  }

  // Maintain focus on current step
  maintainStepFocus(): void {
    if (this.stepper && !this.isNavigating) {
      // Only maintain focus if user clicked outside stepper, not when navigating
      setTimeout(() => {
        if (this.stepper.selectedIndex !== this.currentStepIndex && !this.isNavigating) {
          this.stepper.selectedIndex = this.currentStepIndex;
        }
      }, 0);
    }
  }

  // Handle clicks outside stepper
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Check if click is outside stepper by looking for stepper class
    const stepperElement = document.querySelector('mat-stepper');

    // If click is outside stepper and not navigating, maintain current step focus
    if (stepperElement && !stepperElement.contains(target) && !this.isNavigating) {
      // Only maintain focus if it's not a button click (Next/Back buttons)
      if (!target.closest('button[matStepperNext]') && !target.closest('button[matStepperPrevious]')) {
        this.maintainStepFocus();
      }
    }

    // Reset manual click flag for any document click
    this.isManualClick = false;
  }

  // toggleHighlight(option: string) {
  //   const control = this.roomForm.get('highlights') as FormControl<string[]>;
  //   if (!control) return;

  //   const current: string[] = Array.isArray(control.value) ? [...control.value] : [];

  //   const idx = current.indexOf(option);
  //   if (idx > -1) {
  //     current.splice(idx, 1);
  //   } else {
  //     if (current.length >= 2) {
  //       return;
  //     }
  //     current.push(option);
  //   }

  //   this.selectedOptions = current;
  //   control.setValue([...current]);
  //   control.markAsTouched();
  //   control.updateValueAndValidity();
  // }

  isHighlightSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  onPriceChange() {
    const basePrice = this.roomForm.get('basePrice')?.value || 0;
    this.guestPrice = Math.round(basePrice * (1 + this.taxRate));
    this.roomForm.get('price_per_night')?.setValue(basePrice);
  }

  // Method to handle image uploads and convert to URLs
  async processImages(files: File[]): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const file of files) {
      try {
        // Convert file to base64 or upload to server
        const base64 = await this.fileToBase64(file);
        imageUrls.push(base64);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    return imageUrls;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Main method to create room
  async createRoom() {
    if(this.roomForm.value.confirmPhotos && this.roomForm.value.confirmPhotos.length > 0) {
      try {
        // Get image files
        const files: File[] = this.roomForm.get('confirmPhotos')?.value || [];

        // Prepare room data
        const roomData: any = {
          title: this.roomForm.get('title')?.value || undefined,
          description: this.roomForm.get('description')?.value || undefined,
          room_type_id: this.roomForm.get('room_type_id')?.value || undefined,
          location: this.roomForm.get('location')?.value || undefined,
          address: this.roomForm.get('address')?.value || undefined,
          city: this.roomForm.get('city')?.value || undefined,
          country: this.roomForm.get('country')?.value || undefined,
          latitude: this.roomForm.get('latitude')?.value || 0,
          longitude: this.roomForm.get('longitude')?.value || 0,
          max_guests: this.roomForm.get('guests')?.value || 0,
          bedrooms: this.roomForm.get('bedrooms')?.value || 0,
          beds: this.roomForm.get('beds')?.value || 0,
          bathrooms: this.roomForm.get('bathrooms')?.value || 0,
          price_per_night: this.roomForm.get('basePrice')?.value || 0,
          amenities: this.roomForm.get('amenities')?.value || [],
          images: files, // Mảng File objects
          host_id: this.mineProfile.id, // TODO: Get from auth state
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Creating room with data:', roomData);

        // Dispatch action to create room
        // this.store.dispatch(RoomActions.createRoom({ room: roomData, idToken: this.idToken }));

      } catch (error) {
        console.error('Error creating room:', error);
      }
    }else{
      this.snackBar.showAlert('Please select at least one image', 'error', 3000, 'right','top');
    }

  }

  private markFormGroupTouched() {
    Object.keys(this.roomForm.controls).forEach(key => {
      const control = this.roomForm.get(key);
      control?.markAsTouched();
    });
  }

  // Method to get form validation status
  isFormValid(): boolean {
    return this.roomForm.valid;
  }

  // Method to get form data for debugging
  getFormData() {
    return this.roomForm.value;
  }

  // Format price for display
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Drag & Drop methods
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();

    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      this.draggedIndex = null;
      return;
    }

    // Lấy mảng files hiện tại
    const currentFiles: File[] = this.roomForm.get('photos')?.value || [];

    // Tạo mảng mới với vị trí đã thay đổi
    const newFiles = [...currentFiles];
    const draggedFile = newFiles[this.draggedIndex];

    // Xóa file ở vị trí cũ
    newFiles.splice(this.draggedIndex, 1);

    // Điều chỉnh dropIndex nếu cần
    let adjustedDropIndex = dropIndex;
    if (this.draggedIndex < dropIndex) {
      adjustedDropIndex = dropIndex - 1;
    }

    // Thêm file vào vị trí mới
    newFiles.splice(adjustedDropIndex, 0, draggedFile);

    // Cập nhật cả photos và confirmPhotos
    this.roomForm.get('photos')?.setValue(newFiles);
    this.roomForm.get('confirmPhotos')?.setValue(newFiles);

    // Cập nhật preview URLs
    this.updatePreviewUrls(newFiles);


    // Reset dragged index
    this.draggedIndex = null;
  }

  private updatePreviewUrls(files: File[]): void {
    this.previewUrls = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}
