import { createReducer, on } from "@ngrx/store";
import { RoomModel } from "../../models/room.model";
import { RoomState } from "../state/room.state";
import * as RoomActions from '../actions/room.actions';

export const initialState: RoomState = {
    roomList: <RoomModel[]>[],
    roomDetail: <RoomModel>{},
    roomListByHostId: <RoomModel[]>[],
    isLoading: false,
    error: null
}


export const roomReducer = createReducer(
    initialState,
   

    on(RoomActions.getRoomList, (state,{type}) =>{
        console.log(type)
        return{
            ...state,
            isLoading: true,
            error: null
        }
    }),

    on(RoomActions.getRoomListSuccess, (state,{type,roomList}) =>{
        console.log(type)
        return{
            ...state,
            roomList: roomList,
            isLoading: false,
            error: null
        }
    }),

    on(RoomActions.getRoomListFailure, (state,{type,error}) =>{
        console.log(type)
        return{
            ...state,
            isLoading: false,
            error: error
        }
    }),

    on(RoomActions.getRoomById, (state,{type}) =>{
        console.log(type)
        return{
            ...state,
            isLoading: true,
            error: null
        }
    }),

    on(RoomActions.getRoomByIdSuccess, (state,{type,roomDetail}) =>{
        console.log(type)
        return{
            ...state,
            roomDetail: roomDetail,
            isLoading: false,
            error: null
        }
    }),

    on(RoomActions.getRoomByIdFailure, (state,{type,error}) =>{
        console.log(type)
        return{
            ...state,
            isLoading: false,
            error: error
        }
    }),

    on(RoomActions.getRoomByHostId, (state,{type}) =>{
        console.log(type)
        return{
            ...state,
            isLoading: true,
            error: null
        }
    }),


    on(RoomActions.getRoomByHostIdSuccess, (state,{type,roomList}) =>{
        console.log(type)
        return{
            ...state,
            roomListByHostId: roomList,
            isLoading: false,
            error: null
        }
    }),


    on(RoomActions.getRoomByHostIdFailure, (state,{type,error}) =>{
        console.log(type)
        return{
            ...state,
            isLoading: false,
            error: error
        }
    }),

)