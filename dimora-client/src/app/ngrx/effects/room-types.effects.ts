import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap, of } from "rxjs";
import { RoomsService } from "../../services/rooms/rooms.service";
import * as RoomTypesActions from "../actions/room-types.actions";
import { catchError } from "rxjs";

export const roomTypesEffects = createEffect(
    (actions$ = inject(Actions), roomTypesService = inject(RoomsService)) => {
        return actions$.pipe(
            ofType(RoomTypesActions.getRoomTypes),
            switchMap(() => roomTypesService.getRoomTypeList()),
            map((roomTypes) => RoomTypesActions.getRoomTypesSuccess({roomTypes})),
            catchError((error) => of(RoomTypesActions.getRoomTypesFailure({error})))
        )
    },
    {functional: true}
)