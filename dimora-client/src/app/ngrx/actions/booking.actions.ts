import { createAction, props } from "@ngrx/store";
import { BookingModel } from "../../models/booking.model";

export const getBooking = createAction(
    '[Booking] Get Booking',
    props<{hostId: string, idToken: string}>()
)

export const getBookingSuccess = createAction(
    '[Booking] Get Booking Success',
    props<{bookingList: BookingModel[]}>()
)

export const getBookingFailure = createAction(
    '[Booking] Get Booking Failure',
    props<{error: any}>()
)   