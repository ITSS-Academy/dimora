import {AuthState} from '../state/auth.state';
import {AuthModel} from '../../models/auth.model';
import { createReducer, on} from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';
export const initialState: AuthState = {
  currentUser: <AuthModel>{},
  mineProfile: <AuthModel>{},
  idToken: '',
  isLoading: false,
  error: null
}

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.storeCurrentUser, (state,{mineProfile,type}) =>{
    console.log(type);
    return {
      ...state,
      mineProfile: mineProfile,
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.storeIdToken, (state,{idToken,type}) =>{
    console.log(type);
    return {
      ...state,
      idToken: idToken,
      isLoading: false,
      error: null
    }
  }),


  on(AuthActions.getUserByGoogleId, (state, {type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.getUserByGoogleIdSuccess, (state,{mineProfile,type}) =>{
    console.log(type);
    return {
      ...state,
      mineProfile: mineProfile,
      isLoading: false,
      error: null
    }
  }),


  //get user by id
  on(AuthActions.getUserById, (state, {type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.getUserByIdSuccess, (state,{currentUser,type}) =>{
    console.log(type);
    return {
      ...state,
      currentUser: currentUser,
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.getUserByIdFailure, (state, {type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.getUserByGoogleIdFailure, (state,{type, error}) =>{
    console.log(type);
    console.log(error)
    return {
      ...state,
      isLoading: false,
      error: error
    }
  }),

  on(AuthActions.loginFailure, (state,{type, error}) =>{
    console.log(type);
    console.log(error)
    return {
      ...state,
      isLoading: false,
      error: error
    }
  }),

  on(AuthActions.loginSuccess, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: null
    }
  }),


  on(AuthActions.logout, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.logoutSuccess, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      mineProfile: <AuthModel>{},
      idToken: '',
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.logoutFailure, (state, {error, type}) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error
    }
  }),


  on(AuthActions.clearAuthState, (state,{type})=>{
    console.log(type);
    return {
      ...state,
      currentUser: <AuthModel>{},
      idToken: '',
      isLoading: false,
      error: null
    }
  })


);
