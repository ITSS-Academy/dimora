import { RoomModel } from "../../models/room.model";

export interface SearchState {
    searchRooms: RoomModel[];
    isLoading: boolean;
    error: any;
}