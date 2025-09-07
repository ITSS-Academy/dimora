import { Component, OnDestroy, OnInit } from '@angular/core';
import { RoomState } from '../../../ngrx/state/room.state';
import { Store } from '@ngrx/store';
import { RoomModel } from '../../../models/room.model';
import { Observable, Subscription } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-rooms',
  imports: [CardComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit, OnDestroy {

  roomListByHostId$ !: Observable<RoomModel[]>
  subscriptions: Subscription[] = []
  roomListByHostId: RoomModel[] = []
  constructor(private store: Store<{room: RoomState}>) {
    this.roomListByHostId$ = this.store.select('room','roomListByHostId')
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.roomListByHostId$.subscribe(roomListByHostId => {
        if(roomListByHostId){
          this.roomListByHostId = roomListByHostId
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

}
