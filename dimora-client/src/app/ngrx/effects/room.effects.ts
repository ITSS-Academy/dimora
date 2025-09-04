import { Actions, createEffect, ofType } from "@ngrx/effects";
import { RoomsService } from "../../services/rooms/rooms.service";
import { inject } from "@angular/core";
import { catchError, map, of, switchMap } from "rxjs";
import * as RoomActions from "../actions/room.actions";

export const roomEffects = createEffect(
    (actions$ = inject(Actions), roomsService = inject(RoomsService)) => {
        return actions$.pipe(
            ofType(RoomActions.getRoomList),
            switchMap(() => roomsService.getRoomList().pipe(
                map((roomList) => RoomActions.getRoomListSuccess({roomList})),
                catchError((error) => of(RoomActions.getRoomListFailure({error})))
            ))
        )
    },
    {functional: true}
)

export const getRoomByIdEffects = createEffect(
    (actions$ = inject(Actions), roomsService = inject(RoomsService)) => {
        return actions$.pipe(
            ofType(RoomActions.getRoomById),
            switchMap((action) => roomsService.getRoomById(action.id).pipe(
                map((roomDetail) => RoomActions.getRoomByIdSuccess({roomDetail: roomDetail})),
                catchError((error) => of(RoomActions.getRoomByIdFailure({error})))
            ))
        )
    },
    {functional: true}
)

export const getRoomByHostIdEffects = createEffect(
    (actions$ = inject(Actions), roomsService = inject(RoomsService)) => {
        return actions$.pipe(
            ofType(RoomActions.getRoomByHostId),
            switchMap((action) => roomsService.getRoomByHostId(action.hostId).pipe(
                map((roomList) => {
                    return RoomActions.getRoomByHostIdSuccess({roomList: roomList})
                }),
                catchError((error) => of(RoomActions.getRoomByHostIdFailure({error})))
            ))
        )
    },
    {functional: true}
)