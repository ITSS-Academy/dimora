import { AvailabilityDateModel } from "../../models/availability-date.model";
import { RoomModel } from "../../models/room.model";
export interface RoomState {
    roomList: RoomModel[];
    roomDetail: RoomModel;
    roomListByHostId: RoomModel[];
    isLoading: boolean;
    isCreatingSuccess: boolean;
    error: any;
}