import { AmenitiesModel } from "../../models/amenities.model";

export interface AmenitiesState {
    amenities: AmenitiesModel[];
    isLoading: boolean;
    error: any;
}