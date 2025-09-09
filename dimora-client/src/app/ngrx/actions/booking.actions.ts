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


export const createBooking = createAction(
    '[Booking] Create Booking',
    props<{booking: BookingModel, idToken: string}>()
)

export const createBookingSuccess = createAction(
    '[Booking] Create Booking Success',
    props<{booking: BookingModel}>()
)

export const createBookingFailure = createAction(
    '[Booking] Create Booking Failure',
    props<{error: any}>()
)

//clear booking state
export const clearBookingState = createAction(
    '[Booking] Clear Booking State'
)