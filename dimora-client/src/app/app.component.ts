import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ShareModule} from './shared/share.module';
import {MaterialModule} from './shared/material.module';

import * as AuthActions from './ngrx/actions/auth.actions';
import {Store} from '@ngrx/store';
import {AuthState} from './ngrx/state/auth.state';
import {Auth} from '@angular/fire/auth';
import {AuthModel} from './models/auth.model';
import {HeaderComponent} from './shared/components/header/header.component';
import {Observable, Subscription} from 'rxjs';
import * as AmenitiesActions from './ngrx/actions/amenities.actions';
import { AmenitiesModel } from './models/amenities.model';
import { AmenitiesState } from './ngrx/state/amenities.state';
import { RoomState } from './ngrx/state/room.state';
import * as RoomActions from './ngrx/actions/room.actions';
import * as RoomTypesActions from './ngrx/actions/room-types.actions';
import { RoomTypesState } from './ngrx/state/room-types.state';
  
@Component({
  selector: 'app-root',
  imports: [ShareModule, MaterialModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'dimora-client';
  currentUser$ !: Observable<AuthModel>
  currentUser =  <AuthModel>{};
  subscription: Subscription[] = [];
  amenities$ !: Observable<AmenitiesModel[]>

  constructor(
    private auth: Auth,
    private store:Store<{
    auth: AuthState,
    amenities: AmenitiesState,
    room: RoomState,
    roomTypes: RoomTypesState
  }>) {
    this.currentUser$ = this.store.select('auth', 'currentUser');
    this.store.dispatch(AmenitiesActions.getAllAmenities());
    this.amenities$ = this.store.select('amenities', 'amenities');
    this.store.dispatch(RoomTypesActions.getRoomTypes());
    // Initialization logic can go here if needed
    this.auth.onAuthStateChanged(async (auth:any) =>{
      if (auth) {
        let idToken = await auth.getIdToken();
        console.log(idToken)
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
