import {Store} from '@ngrx/store';
import {AuthService} from '../../services/auth/auth.service';
import {AuthState} from '../../ngrx/state/auth.state';
import {Observable, Subscription} from 'rxjs';
import {AuthModel} from '../../models/auth.model';
import {AsyncPipe, NgOptimizedImage} from '@angular/common';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {ActivatedRoute} from '@angular/router';
import * as AuthActions from '../../ngrx/actions/auth.actions';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { ScheduleComponent } from './schedule/schedule.component';
import { MaterialModule } from '../../shared/material.module';
import { HistoryComponent } from './history/history.component';
import { MatDialog } from '@angular/material/dialog';
import {DialogUpdateProfileComponent} from '../../shared/components/dialog-update-profile/dialog-update-profile.component';
import { RoomState } from '../../ngrx/state/room.state';
import { RoomModel } from '../../models/room.model';
import * as RoomActions from '../../ngrx/actions/room.actions';
import { CardComponent } from "../../shared/components/card/card.component";
import { RoomsComponent } from './rooms/rooms.component';
@Component({
  selector: 'app-profile',

  imports: [
    MatTab,
    MatTabGroup,
    ScheduleComponent,
    MaterialModule,
    HistoryComponent,
    AsyncPipe,
    LoadingComponent,
    RoomsComponent
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  dialog = inject(MatDialog);
  profile = <AuthModel>{};
  currentProfile$ !: Observable<AuthModel>
  idToken$ !: Observable<string>
  mineProfile$ !: Observable<AuthModel>
  isLoading$ !: Observable<boolean>
  subscription: Subscription[] = [];
  idToken: string = '';
  mineProfile: AuthModel = <AuthModel>{};
  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<{
    auth: AuthState,
    room: RoomState
  }>) {
    this.activatedRoute.params.subscribe(params => {
      const userId = params['id'];
      this.store.dispatch(AuthActions.getUserById({id: userId}))
      this.store.dispatch(RoomActions.getRoomByHostId({hostId: userId}))
      // You can use the userId to fetch user-specific data if needed
    })

    this.currentProfile$ = this.store.select('auth','currentUser')
    this.isLoading$ = this.store.select('auth','isLoading')
    this.idToken$ = this.store.select('auth','idToken')
    this.mineProfile$ = this.store.select('auth','mineProfile')
  }

  ngOnInit() {
    this.subscription.push(
      this.currentProfile$.subscribe(profile => {
        if (profile.id){
          this.profile = profile;
        }
      }),
      this.idToken$.subscribe(idToken => {
        if (idToken) {
          this.idToken = idToken;
        }
      }),
      this.mineProfile$.subscribe(mineProfile => {
        if (mineProfile.id) {
          this.mineProfile = mineProfile;
        }
      }),
    )

  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => subscription.unsubscribe());
  }


  openDialog() {
    const dialogRef = this.dialog.open(DialogUpdateProfileComponent, {
      data: {
        profile: this.profile,
        idToken: this.idToken,
      },
      width: '400px'
    });


  }


}



