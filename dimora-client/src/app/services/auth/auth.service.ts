import { Injectable } from '@angular/core';
import {Auth, signInWithPopup, GoogleAuthProvider} from '@angular/fire/auth';
import {HttpClient} from '@angular/common/http';
import {AuthModel} from '../../models/auth.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private http: HttpClient) { }

  async login() {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return credential.user

  }

  async logout() {
    await this.auth.signOut();
  }

   getUserWithGoogleId(googleId: string, idToken: string) {
    return this.http.get<AuthModel>(`${environment.apiUrl}users/google/${googleId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }



  getUserById(userId: string) {
    return this.http.get<AuthModel>(`${environment.apiUrl}users/${userId}`);
  }

}
