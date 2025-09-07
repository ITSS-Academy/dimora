import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import * as BookingActions from '../actions/booking.actions';
import { BookingService } from "../../services/booking/booking.service";
export const bookingEffects = createEffect(
    (actions$ = inject(Actions), bookingService = inject(BookingService)) => {
        return actions$.pipe(
            ofType(BookingActions.getBooking),
            switchMap((action) => bookingService.getBooking(action.hostId, action.idToken).pipe(
                map((bookingList) => BookingActions.getBookingSuccess({bookingList:bookingList})),
                catchError((error) => of(BookingActions.getBookingFailure({error})))
            ))
        )
    },
    {functional: true}

)

export const createBookingEffects = createEffect(
    (actions$ = inject(Actions), bookingService = inject(BookingService)) => {
        return actions$.pipe(
            ofType(BookingActions.createBooking),
            switchMap((action) => bookingService.createBooking(action.booking, action.idToken).pipe(
                map((booking) => BookingActions.createBookingSuccess({booking})),
                catchError((error) => of(BookingActions.createBookingFailure({error})))
            ))
        )
    },
    {functional: true}
)