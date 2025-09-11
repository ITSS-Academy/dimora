import { createAction, props } from '@ngrx/store';
import { AuthModel } from '../../models/auth.model';

export const login = createAction('[Auth] Login');

export const loginSuccess = createAction('[Auth] Login Success');

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

export const storeCurrentUser = createAction(
  '[Auth] Store Current User',
  props<{ mineProfile: AuthModel }>()
);

export const storeIdToken = createAction(
  '[Auth] Store Id Token',
  props<{ idToken: string }>()
);

export const getUserByGoogleId = createAction(
  '[Auth] Get User By Google Id',
  props<{ googleId: string; idToken: string }>()
);

export const getUserByGoogleIdSuccess = createAction(
  '[Auth] Get User By Google Id Success',
  props<{ mineProfile: AuthModel }>()
);

export const getUserByGoogleIdFailure = createAction(
  '[Auth] Get User By Google Id Failure',
  props<{ error: any }>()
);

//get usser by id
export const getUserById = createAction(
  '[Auth] Get User By Id',
  props<{ id: string }>()
);

export const getUserByIdSuccess = createAction(
  '[Auth] Get User By Id Success',
  props<{ currentUser: AuthModel }>()
);

export const getUserByIdFailure = createAction(
  '[Auth] Get User By Id Failure',
  props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: any }>()
);

//update profile
export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ profile: any; idToken: string }>()
);
export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ profile: AuthModel }>()
);
export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: any }>()
);

export const clearAuthState = createAction('[Auth] Clear Auth State');



export const clearCurrentUser = createAction(
  '[Auth] Clear Current User',
)
