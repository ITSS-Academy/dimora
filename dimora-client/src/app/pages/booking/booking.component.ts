import { Component, OnInit, OnDestroy } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { BookingState } from '../../ngrx/state/booking.state';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/state/auth.state';
import { RoomState } from '../../ngrx/state/room.state';
import { BookingModel } from '../../models/booking.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AuthModel } from '../../models/auth.model';
import * as RoomActions from '../../ngrx/actions/room.actions';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { RoomModel } from '../../models/room.model';
import * as BookingActions from '../../ngrx/actions/booking.actions';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    NgIf,
    LoadingComponent,
    AsyncPipe,
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit, OnDestroy {
  bookingForm!: FormGroup;

  // Booking data from route params or state
  roomId: string = '';
  checkInDate: string = '';
  checkOutDate: string = '';
  adults: number = 0;
  children: number = 0;
  infants: number = 0;
  totalAmount: number = 0;
  hostId: string = '';

  // Getter to calculate total guests
  get totalGuests(): number {
    return this.adults + this.children + this.infants;
  }

  currentRoom$!: Observable<RoomModel>;
  subscription: Subscription[] = [];
  mineProfile$!: Observable<AuthModel>;
  isLoading$!: Observable<boolean>;
  idToken$!: Observable<string>;
  mineProfile: AuthModel = <AuthModel>{};
  errorBooking$!: Observable<any>;
  idToken: string = '';
  bookingSuccess$!: Observable<boolean>;

  bookingLoading$!: Observable<boolean>;

  constructor(
    private store: Store<{
      auth: AuthState;
      room: RoomState;
      booking: BookingState;
    }>,
    private route: ActivatedRoute,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    this.initForm();
    this.mineProfile$ = this.store.select('auth', 'mineProfile');
    this.isLoading$ = this.store.select('room', 'isLoading');
    this.idToken$ = this.store.select('auth', 'idToken');
    this.currentRoom$ = this.store.select('room', 'roomDetail');
    this.errorBooking$ = this.store.select('booking', 'error');
    this.bookingLoading$ = this.store.select('booking', 'isLoading');
    this.bookingSuccess$ = this.store.select('booking', 'bookingSuccess');
  }

  ngOnInit(): void {
    this.loadBookingData();
    this.subscription.push(
      this.mineProfile$.subscribe((profile) => {
        if (profile.id) {
          this.mineProfile = profile;
        }
      }),
      this.idToken$.subscribe((token) => {
        if (token) {
          this.idToken = token;
        }
      }),
      this.errorBooking$.subscribe((error) => {
        if (error) {
          console.log(error.error.message);
          this.snackbarService.showAlert(
            error.error.message,
            'error',
            3000,
            'right',
            'top'
          );
        }
      }),
      this.bookingSuccess$.subscribe((success) => {
        if (success) {
          this.snackbarService.showAlert(
            'Đặt phòng thành công!',
            'success',
            3000,
            'right',
            'top'
          );
          this.router.navigate(['/home']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(RoomActions.clearRoomState());
    this.store.dispatch(BookingActions.clearBookingState());
  }

  private initForm(): void {
    this.bookingForm = new FormGroup({
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
      ]),
    });

    // Debug form state
    this.bookingForm.valueChanges.subscribe((value) => {
      console.log('Form value:', value);
      console.log('Form valid:', this.bookingForm.valid);
      console.log('Form errors:', this.bookingForm.errors);
      console.log(
        'Full name errors:',
        this.bookingForm.get('fullName')?.errors
      );
      console.log('Email errors:', this.bookingForm.get('email')?.errors);
      console.log('Phone errors:', this.bookingForm.get('phoneNumber')?.errors);
    });
  }

  private loadBookingData(): void {
    // Load data from route params or store
    this.route.queryParams.subscribe((params) => {
      this.roomId = params['roomId'] || '';
      this.checkInDate = params['checkIn'] || '';
      this.checkOutDate = params['checkOut'] || '';
      this.adults = Number(params['adults']) || 0;
      this.children = Number(params['children']) || 0;
      this.infants = Number(params['infants']) || 0;
      this.totalAmount = Number(params['totalAmount']) || 0;
      this.hostId = params['hostId'] || '';

      if (this.roomId) {
        this.store.dispatch(RoomActions.getRoomById({ id: this.roomId }));
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      const formValue = this.bookingForm.value;

      // Create guest notes from form values
      const guestNotes = `Full Name: ${formValue.fullName}, Email: ${formValue.email}, Phone: ${formValue.phoneNumber}`;

      // Create booking model
      const bookingData: BookingModel = {
        id: '', // Will be generated by backend
        room_id: this.roomId,
        user_id: this.mineProfile.id, // Get from auth state
        host_id: this.hostId, // Get from room data
        check_in_date: this.checkInDate,
        check_out_date: this.checkOutDate,
        guest_count: this.totalGuests,
        total_amount: this.totalAmount + this.totalAmount * 0.1,
        status: 'confirmed',
        guest_notes: guestNotes,
        host_notes: '',
      };

      console.log('Booking Data:', bookingData);

      // TODO: Dispatch booking action
      this.store.dispatch(
        BookingActions.createBooking({
          booking: bookingData,
          idToken: this.idToken,
        })
      );

      // TODO: Navigate to payment page
      // this.router.navigate(['/payment'], { queryParams: { bookingId: bookingData.id } });
    } else {
      console.log('Biểu mẫu không hợp lệ');
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookingForm.controls).forEach((key) => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  // Only allow numbers in phone input
  onPhoneKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true)
    ) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  calculateNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
