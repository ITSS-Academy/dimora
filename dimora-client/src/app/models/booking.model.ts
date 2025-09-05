export interface BookingModel {
    id: string;
    room_id: string;
    user_id: string;
    host_id: string;
    check_in_date: string;
    check_out_date: string;
    guest_count: number;
    total_amount: number;
    status: string;
    guest_notes?: string;
    host_notes?: string;
}