import { createReducer, on } from "@ngrx/store"
import { BookingModel } from "../../models/booking.model"
import { BookingState } from "../state/booking.state"
import * as BookingActions from '../actions/booking.actions'
import { AvailabilityDateModel } from "../../models/availability-date.model"

export const initialState: BookingState = {
    bookingList: <BookingModel[]>[],
    bookingDetail: <BookingModel>{},
    availabilityDates: <AvailabilityDateModel>{},
    isGettingAvailabilityDates: false,
    isLoading: false,
    error: null
}

export const bookingReducer = createReducer(
    initialState,

    on(BookingActions.getBooking, (state,{type}) => {
        console.log(type)
        return {
            ...state,
            isLoading: true,
            error: null
        }
    }),

    on(BookingActions.getBookingSuccess, (state,{type,bookingList}) => {
        console.log(type)
        return {
            ...state,
            bookingList: bookingList,
            isLoading: false,
            error: null
        }
    }),

    on(BookingActions.getBookingFailure, (state,{type,error}) => {
        console.log(type)
        return {
            ...state,
            isLoading: false,
            error: error
        }
    }),

    on(BookingActions.createBooking, (state,{type}) => {
        console.log(type)
        return {
            ...state,
            isLoading: true,
            error: null
        }
    }),

    on(BookingActions.createBookingSuccess, (state,{type,booking}) => {
        console.log(type)
        return {
            ...state,
            bookingDetail: booking,
            isLoading: false,
            error: null
        }
    }),

    on(BookingActions.createBookingFailure, (state,{type,error}) => {
        console.log(type)
        return {
            ...state,
            isLoading: false,
            error: error
        }
    }),

    on(BookingActions.clearBookingState, (state,{type}) => {
        console.log(type)
        return {
            availabilityDates: <AvailabilityDateModel>{},
            bookingDetail: <BookingModel>{},
            bookingList: <BookingModel[]>[],
            isLoading: false,
            isGettingAvailabilityDates: false,
            error: null
        }
    }),

    on(BookingActions.getAvailabilityDates, (state,{type}) => {
        console.log(type)
        return {
            ...state,
            isGettingAvailabilityDates: true,
            error: null
        }
    }),
    on(BookingActions.getAvailabilityDatesSuccess, (state,{type,availabilityDates}) => {
        console.log(type)
        return {
            ...state,
            availabilityDates: availabilityDates,
            isGettingAvailabilityDates: false,
            error: null
        }
    }),

    on(BookingActions.getAvailabilityDatesFailure, (state,{type,error}) => {
        console.log(type)
        return {
            ...state,
            isGettingAvailabilityDates: false,
            error: error
        }
    })
)           