import { BookingModel } from "../../models/booking.model";

export interface BookingState {
    bookingList: BookingModel[] ;
    isLoading: boolean;
    error: any;
}