import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatMenuTrigger } from '@angular/material/menu';
import { provideNativeDateAdapter } from '@angular/material/core';
import * as RoomActions from '../../ngrx/actions/room.actions';
import * as AuthActions from '../../ngrx/actions/auth.actions';
import { AuthState } from '../../ngrx/state/auth.state';
import { RoomState } from '../../ngrx/state/room.state';
import { Store } from '@ngrx/store';
import { BookingState } from '../../ngrx/state/booking.state';
import { Observable, Subscription } from 'rxjs';
import { RoomModel } from '../../models/room.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { AuthModel } from '../../models/auth.model';
import { NotFoundComponent } from '../not-found/not-found.component';
import { MapComponent } from '../../shared/components/map/map.component';
import * as ReviewActions from '../../ngrx/actions/review.actions';
import { ReviewState } from '../../ngrx/state/review.state';
import { ReviewModel } from '../../models/review.models';
@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    LoadingComponent,
    NotFoundComponent,
    MapComponent,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class DetailComponent implements OnInit, OnDestroy {
  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('guestsMenu') guestsMenu!: MatMenuTrigger;

  roomId: string | null = null;
  hostId: string | null = null;
  roomData: any;
  mineProfile: AuthModel | null = null;
  idToken: string = '';

  roomData$!: Observable<RoomModel>;
  isLoading$!: Observable<boolean>;
  subscription: Subscription[] = [];
  currentUser$!: Observable<AuthModel>;
  mineProfile$!: Observable<AuthModel>;
  idToken$!: Observable<string>;
  reviewList$!: Observable<ReviewModel[]>;

  // Form for booking
  bookingForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    guests: new FormControl<string>('1 guest'),
  });

  // Guest counts
  adults: number = 1;
  children: number = 0;
  infants: number = 0;
  pets: number = 0;

  minDate = new Date();

  // Price calculation
  totalNights: number = 0;
  totalPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{
      auth: AuthState;
      room: RoomState;
      booking: BookingState;
      reviews: ReviewState;
    }>,
    private snackbar: SnackbarService
  ) {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.roomId = params['id'];
        console.log('Detail ID:', this.roomId);
        if (this.roomId) {
          this.store.dispatch(RoomActions.getRoomById({ id: this.roomId }));
          this.store.dispatch(
            ReviewActions.getReviewList({ roomId: this.roomId })
          );
        }
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['hostId']) {
        this.hostId = queryParams['hostId'];
        if (this.hostId) {
          this.store.dispatch(AuthActions.getUserById({ id: this.hostId }));
        }

        console.log('Host ID:', this.hostId);
      }
    });

    // Fake data (sau này thay bằng API)
    this.roomData = {
      title: 'Studio và bồn tắm trong rừng | Bếp riêng, Ban công',
      images: [
        'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/736f6de3-2004-4bab-b151-074c43995dd1.jpeg?im_w=720',
        'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/15ae967e-8a27-443b-ba92-ced0845546ae.jpeg?im_w=720',
        'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/148fc970-8569-42f2-a420-037b3c3a90e5.jpeg?im_w=720',
        'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/2da4fe38-3571-419e-95f3-3b279732f3a5.jpeg?im_w=720',
        'https://a0.muscache.com/im/pictures/hosting/Hosting-1353653864064161285/original/e86fe868-a312-477b-bc7b-86ce7617db82.jpeg?im_w=720',
      ],
      info: {
        subtitle: 'Toàn bộ căn hộ cho thuê tại Dalat, Việt Nam',
        desc: '2 khách · 1 phòng ngủ · 1 giường · 1 phòng tắm',
        price: 'Giá đã bao gồm mọi khoản phí',
      },
      host: {
        name: 'Baileys Ho',
        avatar: 'https://via.placeholder.com/50',
        subtext: 'Superhost · 11 tháng kinh nghiệm đón tiếp khách',
      },
      features: [
        {
          icon: 'fa-campground',
          title: 'Giải trí ngoài trời',
          subtext:
            'Giường tắm nắng, ăn uống ngoài trời và khu vực BBQ thích hợp cho các chuyến đi mùa hè.',
        },
        {
          icon: 'fa-door-open',
          title: 'Tự nhận phòng',
          subtext: 'Tự nhận phòng bằng cách nhập mã số vào cửa.',
        },
        {
          icon: 'fa-calendar',
          title: 'Hủy miễn phí trước 18 thg 9',
          subtext: 'Được hoàn tiền đầy đủ nếu bạn thay đổi kế hoạch.',
        },
      ],
    };

    this.roomData$ = this.store.select('room', 'roomDetail');
    this.isLoading$ = this.store.select('room', 'isLoading');
    this.currentUser$ = this.store.select('auth', 'currentUser');
    this.mineProfile$ = this.store.select('auth', 'mineProfile');
    this.idToken$ = this.store.select('auth', 'idToken');
    this.reviewList$ = this.store.select('reviews', 'reviewList');
  }

  ngOnInit(): void {
    this.updateGuestsDisplay();
    this.subscription.push(
      this.roomData$.subscribe((roomData) => {
        if (roomData && roomData.id === this.roomId) {
          console.log('Room data:', roomData);
          this.roomData = roomData;
          // Recalculate price when room data is loaded
          this.calculateTotalPrice();
        } else if (roomData === null && this.roomId) {
          // Room not found, redirect to not-found page
          this.router.navigate(['/not-found']);
        }
      }),
      this.mineProfile$.subscribe((mineProfile) => {
        if (mineProfile.id) {
          this.mineProfile = mineProfile;
        }
      }),

      this.idToken$.subscribe((idToken) => {
        this.idToken = idToken;
      }),
      this.reviewList$.subscribe((reviewList) => {
        if (reviewList.length > 0) {
          console.log('Review List:', reviewList);
        }
      })
    );

    // Subscribe to form changes to calculate price
    this.subscription.push(
      this.bookingForm.valueChanges.subscribe(() => {
        this.calculateTotalPrice();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  // Guest control methods
  increaseAdults(event?: Event) {
    if (event) event.stopPropagation();
    const totalGuests = this.adults + this.children + this.infants;
    if (totalGuests < (this.roomData?.max_guests || 0)) {
      this.adults++;
      this.updateGuestsDisplay();
    }
  }

  decreaseAdults(event?: Event) {
    if (event) event.stopPropagation();
    if (this.adults > 1) {
      this.adults--;
      this.updateGuestsDisplay();
    }
  }

  increaseChildren(event?: Event) {
    if (event) event.stopPropagation();
    const totalGuests = this.adults + this.children + this.infants;
    if (totalGuests < (this.roomData?.max_guests || 0)) {
      this.children++;
      this.updateGuestsDisplay();
    }
  }

  decreaseChildren(event?: Event) {
    if (event) event.stopPropagation();
    if (this.children > 0) {
      this.children--;
      this.updateGuestsDisplay();
    }
  }

  increaseInfants(event?: Event) {
    if (event) event.stopPropagation();
    const totalGuests = this.adults + this.children + this.infants;
    if (totalGuests < (this.roomData?.max_guests || 0)) {
      this.infants++;
      this.updateGuestsDisplay();
    }
  }

  decreaseInfants(event?: Event) {
    if (event) event.stopPropagation();
    if (this.infants > 0) {
      this.infants--;
      this.updateGuestsDisplay();
    }
  }

  increasePets(event?: Event) {
    if (event) event.stopPropagation();
    this.pets++;
    this.updateGuestsDisplay();
  }

  decreasePets(event?: Event) {
    if (event) event.stopPropagation();
    if (this.pets > 0) {
      this.pets--;
      this.updateGuestsDisplay();
    }
  }

  updateGuestsDisplay() {
    const total = this.adults + this.children + this.infants;
    let display = '';

    if (total === 1) {
      display = '1 guest';
    } else {
      display = `${total} guests`;
    }

    if (this.pets > 0) {
      display += `, ${this.pets} pet${this.pets > 1 ? 's' : ''}`;
    }

    this.bookingForm.controls.guests.setValue(display);
  }

  onBookRoom() {
    const startDate = this.bookingForm.get('start')?.value;
    const endDate = this.bookingForm.get('end')?.value;
    const totalGuests = this.adults + this.children + this.infants;

    // Validation
    if (!startDate || !endDate) {
      this.snackbar.showAlert(
        'Vui lòng chọn ngày check-in và check-out',
        'error',
        3000,
        'right',
        'top'
      );
      return;
    }

    if (totalGuests === 0) {
      this.snackbar.showAlert(
        'Vui lòng chọn số lượng khách',
        'error',
        3000,
        'right',
        'top'
      );
      return;
    }

    if (totalGuests > (this.roomData?.max_guests || 0)) {
      this.snackbar.showAlert(
        `Số lượng khách không được vượt quá ${this.roomData?.max_guests} người`,
        'error',
        3000,
        'right',
        'top'
      );
      return;
    }

    // Format dates
    const checkInDate = this.formatDateToString(startDate);
    const checkOutDate = this.formatDateToString(endDate);

    // Navigate to booking page with query parameters
    this.router.navigate(['/booking'], {
      queryParams: {
        roomId: this.roomId,
        hostId: this.hostId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: this.adults,
        children: this.children,
        infants: this.infants,
        totalAmount: this.totalPrice || this.roomData?.price_per_night,
      },
    });
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calculateTotalPrice() {
    const startDate = this.bookingForm.get('start')?.value;
    const endDate = this.bookingForm.get('end')?.value;

    if (
      startDate &&
      endDate &&
      this.roomData &&
      this.roomData.price_per_night
    ) {
      // Calculate number of nights
      const timeDiff = endDate.getTime() - startDate.getTime();
      this.totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Calculate total price (price_per_night is already in VND)
      const pricePerNight = Number(this.roomData.price_per_night) || 0;
      this.totalPrice = pricePerNight * this.totalNights;

      console.log('Price calculation:', {
        startDate,
        endDate,
        totalNights: this.totalNights,
        pricePerNight,
        totalPrice: this.totalPrice,
      });
    } else {
      this.totalNights = 0;
      this.totalPrice = 0;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }
  profileReview = new FormGroup({
    comment: new FormControl(''),
    room_id: new FormControl(''),
    user_id: new FormControl(''),
  });
  onCreateReview() {
    if (!this.profileReview.value.comment) {
      this.snackbar.showAlert(
        'Vui lòng nhap noi dung danh gia',
        'error',
        3000,
        'right',
        'top'
      );
      return;
    } else {
      let reviewData = {
        comment: this.profileReview.value.comment,
        room_id: this.roomId,
        user_id: this.mineProfile?.id,
      };
      this.store.dispatch(
        ReviewActions.createReview({
          review: reviewData,
          idToken: this.idToken,
        })
      );
    }
  }
}
