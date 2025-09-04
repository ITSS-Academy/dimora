import { createAction, props } from "@ngrx/store";
import { RoomModel } from "../../models/room.model";

//get room list
export const getRoomList = createAction(
    '[Room] Get Room List',
)

export const getRoomListSuccess = createAction(
    '[Room] Get Room List Success',
    props<{roomList: RoomModel[]}>()
)

export const getRoomListFailure = createAction(
    '[Room] Get Room List Failure',
    props<{error: any}>()
)

//get room by id

export const getRoomById = createAction(
    '[Room] Get Room By Id',
    props<{id: string}>()
)

export const getRoomByIdSuccess = createAction(
    '[Room] Get Room By Id Success',
    props<{roomDetail: RoomModel}>()
)

export const getRoomByIdFailure = createAction(
    '[Room] Get Room By Id Failure',
    props<{error: any}>()
)