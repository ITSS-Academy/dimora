import { createReducer, on } from "@ngrx/store"
import { BookingModel } from "../../models/booking.model"
import { BookingState } from "../state/booking.state"
import * as BookingActions from '../actions/booking.actions'

export const initialState: BookingState = {
    bookingList: <BookingModel[]>[],
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
    })
)           