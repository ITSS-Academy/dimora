import { createAction, props } from '@ngrx/store';
import { ReviewModel } from '../../models/review.models';
export const getReviewList = createAction(
  '[Review] Get Review List',
  props<{ roomId: string }>()
);
export const getReviewListSuccess = createAction(
  '[Review] Get Review Success',
  props<{ reviewList: ReviewModel[] }>()
);
export const getReviewListFailure = createAction(
  '[Review] Get Review Failure',
  props<{ error: any }>()
);
export const createReview = createAction(
  '[Review] Create Review',
  props<{ review: any; idToken: string }>()
);
export const createReviewSuccess = createAction(
  '[Review] Create Review Success',
  props<{ review: ReviewModel }>()
);
export const createReviewFailure = createAction(
  '[Review] Create Review Failure',
  props<{ error: any }>()
);
