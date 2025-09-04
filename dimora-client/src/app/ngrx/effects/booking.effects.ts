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