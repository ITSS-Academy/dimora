import { AuthModel } from './auth.model';

export interface ReviewModel {
  id: string;
  room_id: string;
  user_id: string;
  comment: string;
  user_info?: AuthModel;
  created_at: string;
}
