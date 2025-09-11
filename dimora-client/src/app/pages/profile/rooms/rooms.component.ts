import { Component, OnDestroy, OnInit } from '@angular/core';
import { RoomState } from '../../../ngrx/state/room.state';
import { Store } from '@ngrx/store';
import { RoomModel } from '../../../models/room.model';
import { Observable, Subscription } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import {AuthModel} from '../../../models/auth.model';
import {AuthState} from '../../../ngrx/state/auth.state';

@Component({
  selector: 'app-rooms',
  imports: [CardComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit, OnDestroy {
  currentProfile$ !: Observable<AuthModel>
  mineProfile$ !: Observable<AuthModel>
  roomListByHostId$ !: Observable<RoomModel[]>
  subscriptions: Subscription[] = []
  roomListByHostId: RoomModel[] = []
  currentUserId: string = ''
  profileId: string = ''
  constructor(private store: Store<{room: RoomState, auth: AuthState}>) {
    this.roomListByHostId$ = this.store.select('room','roomListByHostId')
    this.currentProfile$ = this.store.select('auth','currentUser')
    this.mineProfile$ = this.store.select('auth','mineProfile')
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.roomListByHostId$.subscribe(roomListByHostId => {
        if(roomListByHostId){
          console.log("roomListByHostId",roomListByHostId)
          this.roomListByHostId = roomListByHostId

        }
      }),

      this.currentProfile$.subscribe(profile => {
        if (profile.id){
          this.currentUserId = profile.id
        }
      }),
      this.mineProfile$.subscribe(mineProfile => {
        if (mineProfile.id){
          this.profileId = mineProfile.id
        }
      })


    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

}
