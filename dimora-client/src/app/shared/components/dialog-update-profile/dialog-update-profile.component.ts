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
  console.log(this.data.profile.fullName)
  }

  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('input', input);
    if (input.files && input.files[0]) {
      const file = input.files[0];

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
    const updatedProfile = {
      ...this.data.profile,
      avatar: this.previewUrl || this.data.profile.avatar
    };

    // TODO: gọi API update
    console.log('Profile sau khi save:', updatedProfile);
  }


}
