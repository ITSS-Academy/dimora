import { createReducer, on } from "@ngrx/store";
import { AmenitiesModel } from "../../models/amenities.model";
import { AmenitiesState } from "../state/amenities.state";
import * as AmenitiesActions from "../actions/amenities.actions";
export const initialState: AmenitiesState = {
    amenities: <AmenitiesModel[]>[],
    isLoading: false,
    error: null
}

export const amenitiesReducer = createReducer(
    initialState,
    on(AmenitiesActions.getAllAmenities, (state,{type}) => {
        console.log(type)
        return {
            ...state,
            isLoading: true,
            error: null
        }
    }),

    on(AmenitiesActions.getAllAmenitiesSuccess, (state,{type,amenities}) => {
        console.log(type)
        return {
            ...state,
            amenities: amenities,
            isLoading: false,
            error: null
        }
    }),

    on(AmenitiesActions.getAllAmenitiesFailure, (state,{type,error}) => {
        console.log(type)
        return {
            ...state,
            isLoading: false,
            error: error
        }
    })
)