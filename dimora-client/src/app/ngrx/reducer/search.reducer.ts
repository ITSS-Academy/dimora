import { createReducer, on } from "@ngrx/store";
import { SearchState } from "../state/search.state";
import * as SearchActions from '../actions/search.actions';
import { RoomModel } from "../../models/room.model";

export const initialState: SearchState = {
    searchRooms: <RoomModel[]>[],
    isLoading: false,
    error: null
}

export const searchReducer = createReducer(
    initialState,

    on(SearchActions.searchRooms,(state,{type})=>{
        console.log(type)
        return {
            ...state,
            isLoading: true,
            error: null
        }
    }),
    
    on(SearchActions.searchRoomsSuccess,(state,{type,rooms})=>{
        console.log(type)
        return {
            ...state,
            searchRooms: rooms,
            isLoading: false,
            error: null
        }
    }),
    
    on(SearchActions.searchRoomsFailure,(state,{type,error})=>{
        console.log(type)
        return {
            ...state,
            isLoading: false,
            error: error
        }
    })
)