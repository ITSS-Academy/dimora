import { ReviewModel } from '../../models/review.models';

export interface ReviewState {
  reviewList: ReviewModel[];
  isLoading: boolean;
  error: any;
}
