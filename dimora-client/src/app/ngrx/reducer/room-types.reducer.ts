import { createReducer, on } from "@ngrx/store";
import { RoomTypeModel } from "../../models/room_type.model";
import { RoomTypesState } from "../state/room-types.state";
import * as RoomTypesActions from '../actions/room-types.actions';

export const initialState: RoomTypesState = {
    roomTypes: <RoomTypeModel[]>[],
    isLoading: false,
    error: null
}

export const roomTypesReducer = createReducer(


    initialState,

    on(RoomTypesActions.getRoomTypes, (state,{type})=>{
        return {
            ...state,
            isLoading: true,
            error: null
        }
    }),

    on(RoomTypesActions.getRoomTypesSuccess, (state,{type,roomTypes})=>{
        return {
            ...state,
            roomTypes: roomTypes,
            isLoading: false,
            error: null
        }
    }),

    on(RoomTypesActions.getRoomTypesFailure, (state,{type,error})=>{
        return {
            ...state,
            isLoading: false,
            error: error
        }
    })
)