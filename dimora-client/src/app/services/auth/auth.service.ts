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

  updateProfile(profileForm: any, idToken: string) {
    const formData = new FormData();
    console.log(profileForm);
    
    // Add all form values to FormData
    Object.keys(profileForm).forEach(key => {
      const value = profileForm[key];
      if (value !== null && value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          // File avatar với key "avatar"
          formData.append('avatar', value);
        } else {
          // Các field khác
          formData.append(key, value.toString());
        }
      }
    });
    
    return this.http.patch<AuthModel>(`${environment.apiUrl}users/${profileForm.id}`, formData, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }

}
