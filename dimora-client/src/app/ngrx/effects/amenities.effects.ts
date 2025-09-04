import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AmenitiesService } from "../../services/amenities/amenities.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import * as AmenitiesActions from "../actions/amenities.actions";

export const amenitiesEffects = createEffect(
    (actions$ = inject(Actions), amenitiesService = inject(AmenitiesService)) => {
        return actions$.pipe(
            ofType(AmenitiesActions.getAllAmenities),
            switchMap(() => amenitiesService.getAllAmenities()),
            map((amenities) => AmenitiesActions.getAllAmenitiesSuccess({amenities: amenities})),
            catchError((error) => of(AmenitiesActions.getAllAmenitiesFailure({error: error.message})))
        )
    },
    {functional: true}
)