import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MaterialModule} from '../../material.module';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-dialog-update-profile',
  imports: [MaterialModule, FormsModule],
  templateUrl: './dialog-update-profile.component.html',
  styleUrl: './dialog-update-profile.component.scss'
})
export class DialogUpdateProfileComponent {
  data = inject(MAT_DIALOG_DATA);
  profile: any;

  constructor() {
  console.log(this.data.profile.name)
  }

  saveProfile() {

  }

  openEditDialog() {

  }

}
