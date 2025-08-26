import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ShareModule} from './shared/share.module';
import {MaterialModule} from './shared/material.module';
import {MapComponent} from './shared/components/map/map.component';
import * as AuthActions from './ngrx/actions/auth.actions';
import {Store} from '@ngrx/store';
import {AuthState} from './ngrx/state/auth.state';
import {Auth} from '@angular/fire/auth';
import {AuthModel} from './models/auth.model';
import {HeaderComponent} from './shared/components/header/header.component';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [ShareModule, MaterialModule, MapComponent, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'dimora-client';
  currentUser$ !: Observable<AuthModel>
  currentUser =  <AuthModel>{};
  subscription: Subscription[] = [];

  constructor(
    private auth: Auth,
    private store:Store<{
    auth: AuthState
  }>) {
    this.currentUser$ = this.store.select('auth', 'currentUser');


    // Initialization logic can go here if needed
    this.auth.onAuthStateChanged(async (auth:any) =>{
      if (auth) {
        let idToken = await auth.getIdToken();
        this.store.dispatch(AuthActions.getUserByGoogleId({googleId: auth.uid, idToken: idToken}))
        this.store.dispatch(AuthActions.storeIdToken({idToken: idToken}))
      } else {
        console.log('No user is signed in.');
      }
    })
  }

  ngOnInit() {
   

  }
}
