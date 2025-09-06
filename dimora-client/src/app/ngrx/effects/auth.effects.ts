import {Actions, createEffect, ofType} from '@ngrx/effects';
import {inject} from '@angular/core';
import * as AuthActions from '../actions/auth.actions';
import {catchError, from, map, of, switchMap} from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';
import {AuthModel} from '../../models/auth.model';


export const authEffects =  createEffect(
  (actions$ = inject(Actions), authService =inject(AuthService)) =>{
    return actions$.pipe(
      ofType(AuthActions.login),
      switchMap(()=>
        from(authService.login()).pipe(
          map(() =>{
            return AuthActions.loginSuccess()
          }),
          catchError((error) => of(AuthActions.loginFailure({error: error.message}))
          )
        )
      )
    )
  },
  {functional: true}
)


export const logoutEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        from(authService.logout()).pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) => of(AuthActions.logoutFailure({error: error.message})))
        )
      )
    );
  },
  {functional: true}
);

// get user by google id effect
export const getUserByGoogleIdEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.getUserByGoogleId),
      switchMap((action) =>
        authService.getUserWithGoogleId(action.googleId, action.idToken).pipe(
          map((currentUser: AuthModel) => {
            return AuthActions.getUserByGoogleIdSuccess({mineProfile: currentUser});
          }),
          catchError((error) => of(AuthActions.getUserByGoogleIdFailure({error: error.message})))
        )
      )
    );
  },
  {functional: true}
)

// get user by id effect
export const getUserByIdEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.getUserById),
      switchMap((action) =>
        authService.getUserById(action.id).pipe(
          map((currentUser: AuthModel) => {
            return AuthActions.getUserByIdSuccess({currentUser: currentUser});
          }),
          catchError((error) => of(AuthActions.getUserByIdFailure({error: error.message})))
        )
      )
    );
  },
  {functional: true}
)

export const updateProfileEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap((action) => authService.updateProfile(action.profile, action.idToken).pipe(
        map((profile: AuthModel) =>{
          console.log('profile', profile);
          return AuthActions.updateProfileSuccess({profile: profile});
        }),
        catchError((error) => of(AuthActions.updateProfileFailure({error: error.message})))
      ))
    )
  },
  {functional: true}
)
