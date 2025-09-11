import {
  Component,
  inject,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ShareModule } from '../../shared/share.module';
import { RoomModel } from '../../models/room.model';
import { Store } from '@ngrx/store';
import * as RoomActions from '../../ngrx/actions/room.actions';
import { RoomState } from '../../ngrx/state/room.state';
import { AuthState } from '../../ngrx/state/auth.state';
import { Observable, Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { GoogleMap, MapGeocoder, MapMarker } from '@angular/google-maps';
import { AmenitiesState } from '../../ngrx/state/amenities.state';
import { AmenitiesModel } from '../../models/amenities.model';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { RoomTypeModel } from '../../models/room_type.model';
import { RoomTypesState } from '../../ngrx/state/room-types.state';
import { Router } from '@angular/router';
import { AuthModel } from '../../models/auth.model';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  LocationService,
  Province,
  District,
  Ward,
} from '../../services/location/location.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-create-post',
  imports: [MaterialModule, ShareModule, GoogleMap, MapMarker, LoadingComponent],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss',
})
export class CreatePostComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoFour') videoFour!: ElementRef<HTMLVideoElement>;

  token$!: Observable<string>;
  amenities$!: Observable<AmenitiesModel[]>;
  subscriptions: Subscription[] = [];
  roomTypes$!: Observable<RoomTypeModel[]>;
  idToken: string = '';
  isCreateRoom$!: Observable<boolean>;
  mineProfile$!: Observable<AuthModel>;
  mineProfile: AuthModel = <AuthModel>{};
  isLoading$!: Observable<boolean>;
  constructor(
    private router: Router,
    private store: Store<{
      room: RoomState;
      auth: AuthState;
      amenities: AmenitiesState;
      roomTypes: RoomTypesState;
    }>,

    private geocoder: MapGeocoder,
    private snackBar: SnackbarService,
    private locationService: LocationService
  ) {
    this.token$ = this.store.select('auth', 'idToken');
    this.amenities$ = this.store.select('amenities', 'amenities');
    this.roomTypes$ = this.store.select('roomTypes', 'roomTypes');
    this.isCreateRoom$ = this.store.select('room', 'isCreatingSuccess');
    this.mineProfile$ = this.store.select('auth', 'mineProfile');
    this.isLoading$ = this.store.select('room', 'isLoading');
  }

  ngOnInit(): void {
    // Add document click listener to maintain stepper focus
    document.addEventListener('click', this.onDocumentClick.bind(this));

    // Load provinces data
    this.loadProvinces();

    this.subscriptions.push(
      this.isCreateRoom$.subscribe((isCreateRoom) => {
        if (isCreateRoom) {
          this.snackBar.showAlert('Room created successfully', 'Close', 3000);
          this.router.navigate(['/profile', this.mineProfile.id]);
        }
      }),
      this.token$.subscribe((token) => {
        this.idToken = token;
      }),
      this.mineProfile$.subscribe((mineProfile) => {
        if (mineProfile.id) {
          this.mineProfile = mineProfile;
        }
      })
    );
  }

  // Load provinces data
  loadProvinces(): void {
    this.locationService.getProvinces().subscribe((provinces) => {
      this.provinces = provinces;
    });
  }

  ngOnDestroy(): void {
    // Remove document click listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));

    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(RoomActions.clearCreateRoomState());

  }
  private playVideo(videoRef: ElementRef<HTMLVideoElement> | undefined) {
    if (videoRef) {
      const videoEl = videoRef.nativeElement;
      videoEl.currentTime = 0;
      videoEl.play().catch((err) => {
        console.warn('Autoplay bị chặn:', err);
      });
    }
  }

  ngAfterViewInit(): void {
    // Component initialized
    setTimeout(() => {
      this.playVideo(this.videoPlayer);
      this.playVideo(this.videoFour);
    }, 300);
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
    confirmPhotos: new FormControl<File[]>(
      [],
      [Validators.required, Validators.minLength(5)]
    ),

    // Step 8 - Title
    title: new FormControl('', [Validators.required, Validators.maxLength(50)]),

    // Step 9 - Highlights

    // Step 10 - Price
    basePrice: new FormControl(null, [
      Validators.required,
      Validators.min(50000),
    ]),

    // Additional fields for room creation
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(50),
    ]),
    address: new FormControl('', Validators.required), // Địa chỉ cụ thể
    location: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ), // Phường + Quận (tự động)
    district: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ), // Quận/Huyện selection
    ward: new FormControl({ value: '', disabled: true }, Validators.required), // Phường/Xã selection
    city: new FormControl('', Validators.required),
    country: new FormControl('Việt Nam', Validators.required),
    latitude: new FormControl(0, Validators.required),
    longitude: new FormControl(0, Validators.required),
    max_guests: new FormControl(0, [Validators.required, Validators.min(1)]),
    price_per_night: new FormControl(0, [
      Validators.required,
      Validators.min(50000),
    ]),
    images: new FormControl<string[]>(
      [],
      [Validators.required, Validators.minLength(5)]
    ),
    is_available: new FormControl(true),
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

  // Location data using LocationService
  provinces: Province[] = [];
  availableDistricts: District[] = [];
  availableWards: Ward[] = [];
  selectedProvince: Province | null = null;
  selectedDistrict: District | null = null;
  selectedWard: Ward | null = null;

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
    return (
      this.selectedProvince !== null &&
      this.selectedDistrict !== null &&
      this.selectedWard !== null &&
      this.roomForm.get('address')?.value?.trim() !== ''
    );
  }

  isLastStep(): boolean {
    return this.currentStepIndex === 9; // Step 10 (index 9) is the last step
  }

  // Location methods using LocationService
  onProvinceChange(provinceId: string): void {
    const province = this.provinces.find((p) => p.province_id === provinceId);
    if (province) {
      this.selectedProvince = province;
      // Set the province_id as value (not province_name)
      this.roomForm.get('city')?.setValue(provinceId);

      // Load districts for selected province
      this.locationService
        .getDistrictsByProvince(provinceId)
        .subscribe((districts) => {
          this.availableDistricts = districts;
          // Enable district control when districts are available
          if (districts.length > 0) {
            this.roomForm.get('district')?.enable();
          } else {
            this.roomForm.get('district')?.disable();
          }
        });

      // Reset district and ward selection
      this.selectedDistrict = null;
      this.selectedWard = null;
      this.availableWards = [];
      this.roomForm.get('district')?.setValue('');
      this.roomForm.get('location')?.setValue('');
      this.roomForm.get('ward')?.setValue('');
      this.roomForm.get('ward')?.disable();
      this.roomForm.get('address')?.setValue('');
    }
  }

  onDistrictChange(districtId: string): void {
    if (this.selectedProvince) {
      const district = this.availableDistricts.find(
        (d) => d.district_id === districtId
      );
      if (district) {
        this.selectedDistrict = district;

        // Update location field with district name only (ward will be added later)
        this.updateLocationField();

        // Load wards for selected district
        this.locationService
          .getWardsByDistrict(districtId)
          .subscribe((wards) => {
            this.availableWards = wards;
            // Enable ward control when wards are available
            if (wards.length > 0) {
              this.roomForm.get('ward')?.enable();
            } else {
              this.roomForm.get('ward')?.disable();
            }
          });

        // Set district form control with district_id
        this.roomForm.get('district')?.setValue(districtId);

        // Reset ward selection
        this.selectedWard = null;
        this.roomForm.get('ward')?.setValue('');
        this.roomForm.get('address')?.setValue('');
      }
    }
  }

  onWardChange(wardId: string): void {
    if (this.selectedDistrict) {
      const ward = this.availableWards.find((w) => w.ward_id === wardId);
      if (ward) {
        this.selectedWard = ward;

        // Update location field with ward + district
        this.updateLocationField();

        // Set ward form control with ward_id
        this.roomForm.get('ward')?.setValue(wardId);

        // Clear address field for user to input specific address
        this.roomForm.get('address')?.setValue('');
        // Don't search yet - wait for user to input address
      }
    }
  }

  onAddressEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchAddress();
  }

  onAddressBlur(): void {
    // Search when user finishes typing and leaves the field
    const address = this.roomForm.get('address')?.value?.trim();
    if (
      address &&
      this.selectedWard &&
      this.selectedDistrict &&
      this.selectedProvince
    ) {
      this.searchAddress();
    }
  }

  onAddressInput(event: any): void {
    // Optional: You can add debouncing here if needed
    // For now, we'll just let the user type and search on blur
  }

  // Update location field with ward + district (for display only)
  updateLocationField(): void {
    if (this.selectedWard && this.selectedDistrict) {
      const location = `${this.selectedWard.ward_name}, ${this.selectedDistrict.district_name}`;
      this.roomForm.get('location')?.setValue(location);
    } else {
      // Clear location field when no ward selected
      this.roomForm.get('location')?.setValue('');
    }
  }

  onSelectEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // For select fields, just prevent default behavior
    // The selectionChange event will handle the search
  }

  // Search and geocoding methods
  searchAddress(): void {
    const specificAddress = this.roomForm.get('address')?.value || '';
    const wardName = this.selectedWard?.ward_name || '';
    const districtName = this.selectedDistrict?.district_name || '';
    const provinceName = this.selectedProvince?.province_name || '';

    if (wardName && districtName && provinceName) {
      // Use specific address if provided, otherwise use ward name
      const addressPart = specificAddress || wardName;
      const fullAddress = `${addressPart}, ${districtName}, ${provinceName}, Việt Nam`;
      this.geocodeAddress(fullAddress);
    }
  }

  geocodeAddress(address: string): void {
    this.geocoder.geocode({ address: address }).subscribe(({ results }) => {
      if (results && results.length > 0) {
        const location = results[0].geometry.location;
        console.log(location);
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
      this.markerPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.reverseGeocode(event.latLng);
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.markerPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
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

  parseAddressComponents(
    components: google.maps.GeocoderAddressComponent[]
  ): void {
    let address = '';
    let city = '';
    let district = '';

    components.forEach((component) => {
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

    // Find province by name and set it
    if (city) {
      const province = this.provinces.find((p) => p.province_name === city);
      if (province) {
        this.onProvinceChange(province.province_id);
      }
    }

    // Find district by name and set it
    if (district && this.selectedProvince) {
      const districtObj = this.availableDistricts.find(
        (d) => d.district_name === district
      );
      if (districtObj) {
        this.onDistrictChange(districtObj.district_id);
      }
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
    this.currentStepIndex = targetStepIndex;
    this.isManualClick = false;

    // Step 1: play videoPlayer
    if (targetStepIndex === 0) {
      this.playVideo(this.videoPlayer);
    }

    // Step 4: play videoFour
    if (targetStepIndex === 3) {
      this.playVideo(this.videoFour);
    }
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
        if (
          this.stepper.selectedIndex !== this.currentStepIndex &&
          !this.isNavigating
        ) {
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
    if (
      stepperElement &&
      !stepperElement.contains(target) &&
      !this.isNavigating
    ) {
      // Only maintain focus if it's not a button click (Next/Back buttons)
      if (
        !target.closest('button[matStepperNext]') &&
        !target.closest('button[matStepperPrevious]')
      ) {
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
      reader.onerror = (error) => reject(error);
    });
  }

  // Main method to create room
  async createRoom() {
    if (
      this.roomForm.value.confirmPhotos &&
      this.roomForm.value.confirmPhotos.length > 0
    ) {
      try {
        // Get image files
        const files: File[] = this.roomForm.get('confirmPhotos')?.value || [];

        // Prepare room data
        const roomData: any = {
          title: this.roomForm.get('title')?.value || undefined,
          description: this.roomForm.get('description')?.value || undefined,
          room_type_id: this.roomForm.get('room_type_id')?.value || undefined,
          location: this.roomForm.get('location')?.value || undefined, // Phường + Quận
          address: this.roomForm.get('address')?.value || undefined, // Địa chỉ cụ thể
          city: this.selectedProvince?.province_name || undefined,
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
          updated_at: new Date().toISOString(),
        };

        console.log('Creating room with data:', roomData);

        // Dispatch action to create room
        this.store.dispatch(
          RoomActions.createRoom({ room: roomData, idToken: this.idToken })
        );
      } catch (error) {
        console.error('Error creating room:', error);
      }
    } else {
      this.snackBar.showAlert(
        'Please select at least one image',
        'error',
        3000,
        'right',
        'top'
      );
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.roomForm.controls).forEach((key) => {
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
      currency: 'VND',
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
