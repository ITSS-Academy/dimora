import { createAction, props } from "@ngrx/store";
import { AmenitiesModel } from "../../models/amenities.model";

export const getAllAmenities = createAction(
    '[Amenities] Get All Amenities',
)

export const getAllAmenitiesSuccess = createAction(
    '[Amenities] Get All Amenities Success',
    props<{amenities: AmenitiesModel[]}>()
)

export const getAllAmenitiesFailure = createAction(
    '[Amenities] Get All Amenities Failure',
    props<{error: string}>()
)