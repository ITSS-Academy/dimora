export class RoomLike {
  /** ID duy nhất của like */
  id: string;
  
  /** ID của phòng được like */
  room_id: string;
  
  /** ID của user đã like */
  user_id: string;
  
  /** Thời gian tạo like */
  created_at: Date;
}
