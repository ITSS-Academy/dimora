import { createReducer, on } from '@ngrx/store';
import { BookingModel } from '../../models/booking.model';
import { BookingState } from '../state/booking.state';
import * as BookingActions from '../actions/booking.actions';

export const initialState: BookingState = {
  bookingList: <BookingModel[]>[],
  bookingDetail: <BookingModel>{},
  isLoading: false,
  bookingSuccess: false,
  error: null,
};

export const bookingReducer = createReducer(
  initialState,

  on(BookingActions.getBooking, (state, { type }) => {
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null,
    };
  }),

  on(BookingActions.getBookingSuccess, (state, { type, bookingList }) => {
    console.log(type);
    return {
      ...state,
      bookingList: bookingList,
      isLoading: false,
      error: null,
    };
  }),

  on(BookingActions.getBookingFailure, (state, { type, error }) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error,
    };
  }),

  on(BookingActions.createBooking, (state, { type }) => {
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null,
      bookingSuccess: false,
    };
  }),

  on(BookingActions.createBookingSuccess, (state, { type, booking }) => {
    console.log(type);
    return {
      ...state,
      bookingDetail: booking,
      isLoading: false,
      bookingSuccess: true,
      error: null,
    };
  }),

  on(BookingActions.createBookingFailure, (state, { type, error }) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      bookingSuccess: false,
      error: error,
    };
  }),

  on(BookingActions.clearBookingState, (state, { type }) => {
    console.log(type);
    return {
      bookingDetail: <BookingModel>{},
      bookingList: <BookingModel[]>[],
      isLoading: false,
      bookingSuccess: false,
      error: null,
    };
  })
);
