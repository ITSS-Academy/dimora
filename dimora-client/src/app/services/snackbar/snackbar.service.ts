import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {SnackbarComponent} from '../../shared/components/snackbar/snackbar.component';
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private _snackBar: MatSnackBar) {}

  showAlert(
    message: string,
    action: string,
    duration?: number,
    horizontalPosition?: MatSnackBarHorizontalPosition,
    verticalPosition?: MatSnackBarVerticalPosition,
  ) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: { message, action },
      duration: duration || 3000,
      horizontalPosition: horizontalPosition || 'right',
      verticalPosition: verticalPosition || 'top',
    });
  }
}
