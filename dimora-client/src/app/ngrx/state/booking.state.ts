import { BookingModel } from "../../models/booking.model";
import { AvailabilityDateModel } from "../../models/availability-date.model";
export interface BookingState {
    bookingList: BookingModel[] ;
    bookingDetail: BookingModel;
    isLoading: boolean;
    isGettingAvailabilityDates: boolean;
    error: any;
    availabilityDates: AvailabilityDateModel;

}