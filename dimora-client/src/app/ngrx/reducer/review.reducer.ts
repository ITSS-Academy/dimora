import { createReducer, on } from '@ngrx/store';
import { ReviewState } from '../state/review.state';
import { ReviewModel } from '../../models/review.models';
import * as ReviewActions from '../actions/review.actions';
export const initialState: ReviewState = {
  reviewList: <ReviewModel[]>[],
  isLoading: false,
  error: null,
};
export const reviewReducer = createReducer(
  initialState,
  on(ReviewActions.getReviewList, (state, { type }) => {
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null,
    };
  }),
  on(ReviewActions.getReviewListSuccess, (state, { type, reviewList }) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      reviewList: reviewList,
    };
  }),
  on(ReviewActions.getReviewListFailure, (state, { type, error }) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error,
    };
  }),
  on(ReviewActions.createReview, (state, { type }) => {
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null,
    };
  }),
  on(ReviewActions.createReviewSuccess, (state, { type, review }) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      reviewList: [...state.reviewList, review],
    };
  }),
  on(ReviewActions.createReviewFailure, (state, { type, error }) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error,
    };
  })
);
