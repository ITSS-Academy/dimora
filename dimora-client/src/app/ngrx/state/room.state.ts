import { RoomModel } from "../../models/room.model";
export interface RoomState {
    roomList: RoomModel[];
    roomDetail: RoomModel;
    roomListByHostId: RoomModel[];
    isLoading: boolean;
    isCreatingRoom: boolean;
    error: any;
}