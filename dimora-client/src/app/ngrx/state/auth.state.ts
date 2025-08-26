import {AuthModel} from '../../models/auth.model';

export interface AuthState {
  currentUser: AuthModel;
  mineProfile: AuthModel;
  idToken: string;
  isLoading: boolean;
  error: any;
}
