import { BookingModel } from "../../models/booking.model";

export interface BookingState {
    bookingList: BookingModel[] ;
    bookingDetail: BookingModel;
    isLoading: boolean;
    error: any;
}