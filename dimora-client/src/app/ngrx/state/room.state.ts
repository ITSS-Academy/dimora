import { RoomModel } from "../../models/room.model";
export interface RoomState {
    roomList: RoomModel[];
    roomDetail: RoomModel;
    isLoading: boolean;
    error: any;
}