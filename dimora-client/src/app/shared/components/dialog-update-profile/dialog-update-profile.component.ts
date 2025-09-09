import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MaterialModule} from '../../material.module';
import {FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import {ShareModule} from '../../share.module';
import * as AuthActions from '../../../ngrx/actions/auth.actions';
import { Store } from '@ngrx/store';
import { AuthState } from '../../../ngrx/state/auth.state';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

@Component({
  selector: 'app-dialog-update-profile',
  imports: [MaterialModule, FormsModule, ShareModule],
  templateUrl: './dialog-update-profile.component.html',
  styleUrl: './dialog-update-profile.component.scss'
})
export class DialogUpdateProfileComponent {
  data = inject(MAT_DIALOG_DATA);
  profile: any;
  constructor(
    private snackbar: SnackbarService,
    private store: Store<{
      auth: AuthState,
    }>
  ) {
  console.log(this.data.profile);
  }

  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('input', input);
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.profileForm.patchValue({ avatar: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);

      // Nếu cần lưu file để upload sau
      // this.selectedFile = file;
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const updatedProfile = {
        id: this.data.profile.id,
        full_name: this.profileForm.value.full_name || this.data.profile.full_name,
        email: this.profileForm.value.email || this.data.profile.email,
        phone: this.profileForm.value.phone || this.data.profile.phone,
        avatar: this.profileForm.value.avatar || this.data.profile.avatar_url,
      };
    console.log('Profile sau khi save:', updatedProfile);
      // this.store.dispatch(AuthActions.updateProfile({profile: updatedProfile, idToken: this.data.idToken}));
    }else{
      this.snackbar.showAlert('Please fill all fields', 'error', 3000, 'right', 'top');
    }

    // TODO: gọi API update
  }

  profileForm = new FormGroup({
    full_name : new FormControl(this.data.profile.full_name, [Validators.required]),
    email : new FormControl(this.data.profile.email, [Validators.required]),
    phone : new FormControl(this.data.profile.phone, [Validators.required]),
    avatar : new FormControl<File | null>(null),
  })


} 
