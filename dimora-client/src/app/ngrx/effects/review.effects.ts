import { Actions, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';
import { ReviewsService } from '../../services/reviews/reviews.service';
import { catchError, map, of, switchMap } from 'rxjs';
import * as ReviewActions from '../actions/review.actions';
export const reviewEffects = createEffect(
  (reviewsService = inject(ReviewsService), actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(ReviewActions.createReview),
      switchMap((action) =>
        reviewsService.createReview(action.review, action.idToken).pipe(
          map((reviewList) =>
            ReviewActions.createReviewSuccess({ review: reviewList })
          ),
          catchError((error) =>
            of(ReviewActions.createReviewFailure({ error }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const getReviewListEffects = createEffect(
  (reviewsService = inject(ReviewsService), actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(ReviewActions.getReviewList),
      switchMap((action) =>
        reviewsService.getReviewList(action.roomId).pipe(
          map((reviewList) =>
            ReviewActions.getReviewListSuccess({ reviewList })
          ),
          catchError((error) =>
            of(ReviewActions.getReviewListFailure({ error }))
          )
        )
      )
    );
  },
  { functional: true }
);
