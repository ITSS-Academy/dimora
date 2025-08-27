import { inject } from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {SearchService} from '../../services/search/search.service';
import * as SearchActions from '../actions/search.actions';
import {catchError, map, of, switchMap} from 'rxjs';



export const searchEffects = createEffect(
  (actions$ = inject(Actions), searchService = inject(SearchService)) => {
    return actions$.pipe(
      ofType(SearchActions.searchRooms),
      switchMap((action) =>
        searchService.searchRooms(action.searchParams).pipe(
          map((searchResult) => {
            return SearchActions.searchRoomsSuccess({rooms: searchResult});
          }),
          catchError((error) => of(SearchActions.searchRoomsFailure({error: error.message})))
        )
      )
    );
  },
  {functional: true}
)
