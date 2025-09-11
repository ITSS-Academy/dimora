import {Component, inject} from '@angular/core';
import {MaterialModule} from '../../material.module';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import * as RoomActions from '../../../ngrx/actions/room.actions';

@Component({
  selector: 'app-dialog-warning',
  imports: [MaterialModule],
  templateUrl: './dialog-warning.component.html',
  styleUrl: './dialog-warning.component.scss'
})
export class DialogWarningComponent {
  data = inject(MAT_DIALOG_DATA);
  constructor(private store:Store<{

  }>) {
    console.log(this.data)
  }

  deleteRoom() {
    this.store.dispatch(RoomActions.deleteRoom({
      roomId: this.data.roomId,
      idToken: this.data.idToken,
      hostId: this.data.hostId
    }))

  }
}
