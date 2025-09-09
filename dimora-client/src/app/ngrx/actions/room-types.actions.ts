import { createAction, props } from "@ngrx/store"
import { RoomTypeModel } from "../../models/room_type.model"

export const getRoomTypes = createAction(
    '[Room Types] Get Room Types',
)

export const getRoomTypesSuccess = createAction(
    '[Room Types] Get Room Types Success',
    props<{roomTypes: RoomTypeModel[]}>()
)

export const getRoomTypesFailure = createAction(
    '[Room Types] Get Room Types Failure',
    props<{error: any}>()
)