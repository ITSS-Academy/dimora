import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import * as AuthActions from '../../../ngrx/actions/auth.actions';
import {Store} from '@ngrx/store';
import { MatDialogClose, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-login',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatDialogClose],
  templateUrl: './dialog-login.component.html',
  styleUrl: './dialog-login.component.scss'
})
export class DialogLoginComponent {

  constructor(private store:Store<{}>, private dialogRef: MatDialogRef<DialogLoginComponent>  ) {
  }



  login() {
    this.store.dispatch(AuthActions.login());
    this.dialogRef.close();
  }
}
