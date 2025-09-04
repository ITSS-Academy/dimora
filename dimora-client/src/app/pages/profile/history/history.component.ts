import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookingState } from '../../../ngrx/state/booking.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history',
  imports: [],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit, OnDestroy {

  constructor(private store: Store<{booking: BookingState}>) {}

  subscription: Subscription[] = [];

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => subscription.unsubscribe());
  }
}
