import {Component, OnDestroy, OnInit} from '@angular/core';
import {MaterialModule} from '../../shared/material.module';
import {max, min, Observable, Subscription} from 'rxjs';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RootCommands} from '@angular/cli/src/commands/command-config';
import {NgForOf} from '@angular/common';
import {GoogleMap, MapGeocoder, MapMarker} from '@angular/google-maps';
import {ShareModule} from '../../shared/share.module';
import {createRoom} from '../../ngrx/actions/room.actions';
import {RoomModel} from '../../models/room.model';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {RoomState} from '../../ngrx/state/room.state';
import * as RoomActions from '../../ngrx/actions/room.actions';
import {LoadingComponent} from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-update-post',
  imports: [
    MaterialModule,
    FormsModule,
    NgForOf,
    GoogleMap,
    ReactiveFormsModule,
    ShareModule,
    MapMarker,
    LoadingComponent
  ],
  templateUrl: './update-post.component.html',
  styleUrl: './update-post.component.scss'
})
export class UpdatePostComponent implements OnInit , OnDestroy{

  roomDetail$!:Observable<RoomModel>
  subscriptions:Subscription[]= []
  roomDetail!:RoomModel
  isLoading$!:Observable<Boolean>

  constructor(
    private store: Store<{
      room: RoomState,
    }>,
    private geocoder: MapGeocoder,
    private route : ActivatedRoute,

  ) {
    let{id} = this.route.snapshot.params;
    console.log(id)
    this.store.dispatch(RoomActions.getRoomById({id:id}))
    this.roomDetail$ = this.store.select('room','roomDetail')
    this.isLoading$ = this.store.select('room','isLoading')

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit(): void {
    this.subscriptions.push(
      this.roomDetail$.subscribe(roomDetails => {
        if (roomDetails.id){
          this.roomDetail = roomDetails;
          console.log(this.roomDetail);
          this.roomForm.patchValue({
            title: roomDetails.title,
            description: roomDetails.description,
            address: roomDetails.address,
            location: roomDetails.location,
            city: roomDetails.city,
            country: roomDetails.country,
            latitude: roomDetails.latitude,
            longitude: roomDetails.longitude,
            max_guests: roomDetails.max_guests,
            price_per_night: roomDetails.price_per_night,
            images: roomDetails.images,
            is_available: roomDetails.is_available,
            room_type_id: roomDetails.room_type_id,
            bedrooms: roomDetails.bedrooms,
            beds: roomDetails.beds,
            bathrooms: roomDetails.bathrooms
          });
          this.Rooms = roomDetails.bedrooms;
          this.Beds = roomDetails.beds;
          this.Bathrooms = roomDetails.bathrooms;
          this.Guests = roomDetails.max_guests;
          this.value = roomDetails.price_per_night;
          this.selectedCity = roomDetails.city;
          this.availableDistricts = this.districts[this.selectedCity] || [];
          this.selectedDistrict = roomDetails.location;
        }
      })
    )
  }

  mapCenter: google.maps.LatLngLiteral = { lat: 10.8231, lng: 106.6297 }; // Hồ Chí Minh
  mapZoom = 12;
  markerPosition: google.maps.LatLngLiteral | null = null;

  selectedCity: string = '';
  availableDistricts: string[] = [];
  foods = [
    { value: 'nha-nghi', viewValue: 'Nhà nghỉ' },
    { value: 'can-ho', viewValue: 'Căn hộ' },
    { value: 'khach-san', viewValue: 'Khách sạn' },
    { value: 'nha-o', viewValue: 'Nhà ở' },
    { value: 'homestay', viewValue: 'Homestay' },
    { value: 'resort', viewValue: 'Resort' }
  ];
  formatLabel: ((value: number) => string) | undefined;
  disabled: boolean = false;


  max = 10000000;
  min = 0;
  step = 10000;
  thumbLabel: unknown;
  showTicks: unknown;
  value: any;
  protected readonly length = length;
  Quantity: any;
  protected readonly GainNode = GainNode;
  protected readonly RootCommands = RootCommands;
  Guests: number = 1;
  Rooms: number = 1;
  Beds: number = 1;
  Bathrooms: number = 1;
  uploadedImages: string[] = [];

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

  selectedProvince: string = '';
  selectedDistrict: string = '';
  detailAddress: string = '';

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.roomForm.patchValue({ photos: Array.from(input.files) });
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  incrementGuests() {
    if (this.Guests < 20) {
      this.Guests++;
    }
  }
  decrementGuests() {
    if (this.Guests > 1) {
      this.Guests--;
    }
  }
  incrementRooms() {
    if (this.Rooms < 20) {
      this.Rooms++;
    }
  }
  decrementRooms() {
    if (this.Rooms > 1) {
      this.Rooms--;
    }
  }
  incrementBeds() {
    if (this.Beds < 20) {
      this.Beds++;
    }
  }
  decrementBeds() {
    if (this.Beds > 1) {
      this.Beds--;
    }
  }
  incrementBathrooms() {
    if (this.Bathrooms < 20) {
      this.Bathrooms++;
    }
  }
  decrementBathrooms() {
    if (this.Bathrooms > 1) {
      this.Bathrooms--;
    }
  }
  onProvinceChange() {
    // @ts-ignore
    this.districts = this.selectedProvince ? this.allDistricts[this.selectedProvince] : [];
    this.selectedDistrict = '';
  }
  formatPrice(price: number): string {
    this.roomForm.patchValue(
      { price_per_night: price }
    )
    return price.toLocaleString('vi-VN');
  }

  protected readonly Number = Number;

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

  onSelectEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // For select fields, just prevent default behavior
    // The selectionChange event will handle the search
  }

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
    max_guests: new FormControl(this.Guests, [Validators.required, Validators.min(1)]),
    price_per_night: new FormControl(0, [Validators.required, Validators.min(50000)]),
    images: new FormControl<string[]>([], [Validators.required, Validators.minLength(5)]),
    is_available: new FormControl(true)
  });





  onDistrictChange(district: string): void {
    this.selectedDistrict = district;
    this.roomForm.get('location')?.setValue(district);
    this.searchAddress();
  }


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

  onAddressEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchAddress();
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


  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.reverseGeocode(event.latLng);
    }
  }

  updateRoom(){
    console.log("run")
    let newRoomData : any = {
      title: this.roomForm.get('title')?.value || '',
      description: this.roomForm.get('description')?.value || '',
      address: this.roomForm.get('address')?.value || '',
      location: this.roomForm.get('location')?.value || '',
      city: this.roomForm.get('city')?.value || '',
      country: this.roomForm.get('country')?.value || 'Việt Nam',
      latitude: this.roomForm.get('latitude')?.value || 0,
      longitude: this.roomForm.get('longitude')?.value || 0,
      max_guests: this.Guests,
      price_per_night: this.roomForm.get('price_per_night')?.value || 50000,
      images: this.roomForm.get('photos')?.value || [],
      is_available: this.roomForm.get('is_available')?.value || true,
      // amenities: this.roomForm.get('amenities')?.value || [],
      room_type_id: this.roomForm.get('room_type_id')?.value || '',
      bedrooms: this.Rooms,
      beds: this.Beds,
      bathrooms: this.Bathrooms
    }
    console.log(newRoomData)

  }

  protected readonly createRoom = createRoom;
  onPriceSliderChange(event: any) {
    const price = event.value;
    this.roomForm.get('price_per_night')?.setValue(price);
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    // Do not patch photos form control with base64 strings
  }


}
