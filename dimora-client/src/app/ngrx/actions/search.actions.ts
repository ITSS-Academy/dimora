import { createAction, props } from "@ngrx/store";
import { RoomModel } from "../../models/room.model";
import { SearchModel } from "../../models/search.model";

export const searchRooms = createAction(
    '[Search] Search Rooms',
    props<{searchParams: SearchModel}>()
)

export const searchRoomsSuccess = createAction(
    '[Search] Search Rooms Success',
    props<{rooms: RoomModel[]}>()
)

export const searchRoomsFailure = createAction(
    '[Search] Search Rooms Failure',
    props<{error: any}>()
)

//clear search state
export const clearSearchState = createAction(
    '[Search] Clear Search State'
)