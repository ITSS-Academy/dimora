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

export const getRoomByHostId = createAction(
    '[Room] Get Room By Host Id',
    props<{hostId: string}>()
)

export const getRoomByHostIdSuccess = createAction(
    '[Room] Get Room By Host Id Success',
    props<{roomList: RoomModel[]}>()
)

export const getRoomByHostIdFailure = createAction(
    '[Room] Get Room By Host Id Failure',
    props<{error: any}>()
)

//create room
export const createRoom = createAction(
    '[Room] Create Room',
    props<{room: any, idToken: string}>()
)

export const createRoomSuccess = createAction(
    '[Room] Create Room Success',
    props<{room: RoomModel}>()
)

export const createRoomFailure = createAction(
    '[Room] Create Room Failure',
    props<{error: any}>()
)

//clear room state
export const clearRoomState = createAction(
    '[Room] Clear Room State'
)

export const clearCreateRoomState = createAction(
    '[Room] Clear Create Room State'
)

export const deleteRoom = createAction(
    '[Room] Delete Room',
    props<{roomId: string, idToken: string, hostId: string}>()
)

export const deleteRoomSuccess = createAction(
    '[Room] Delete Room Success',
    props<{rooms: RoomModel[]}>()
)

export const deleteRoomFailure = createAction(
    '[Room] Delete Room Failure',
    props<{error: any}>()
)
