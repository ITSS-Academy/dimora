import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookingState } from '../../../ngrx/state/booking.state';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { BookingModel } from '../../../models/booking.model';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history',
  imports: [MaterialModule, CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit, OnDestroy {
  bookingList$!: Observable<any[]>;
  bookingList: any[] = [];

  constructor(
    private router: Router,
    private store: Store<{ booking: BookingState }>
  ) {
    this.bookingList$ = this.store.select('booking', 'bookingList');
  }

  subscription: Subscription[] = [];

  ngOnInit(): void {
    this.subscription.push(
      this.bookingList$.subscribe((bookingList) => {
        if (bookingList.length > 0) {
          this.bookingList = bookingList;
          console.log(this.bookingList);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((subscription) => subscription.unsubscribe());
  }

  // Helper methods for template

  getRoomLocation(booking: BookingModel): string {
    // TODO: Get room location from room data
    return 'Đà Lạt, Việt Nam';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      pending: 'Chờ xác nhận',
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Action methods
  viewDetails(booking: any): void {
    console.log(booking);
    console.log(booking.rooms.id);
    console.log(booking.host_id);
    // TODO: Navigate to details with params is room id and query params is hostId=host_id

    this.router.navigate(['/detail', booking.rooms.id], {
      queryParams: { hostId: booking.host_id },
    });
    // TODO: Navigate to details with params id is room id and query params is hostId=host_id
  }

  contactHost(booking: BookingModel): void {
    console.log('Contact host for booking:', booking.id);
    // TODO: Open chat with host
  }

  writeReview(booking: BookingModel): void {
    console.log('Write review for booking:', booking.id);
    // TODO: Navigate to review page
  }
}
