import { RoomTypeModel } from "../../models/room_type.model";

export interface RoomTypesState {
    roomTypes: RoomTypeModel[];
    isLoading: boolean;
    error: any;
}