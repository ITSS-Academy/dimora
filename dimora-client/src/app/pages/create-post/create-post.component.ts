import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { FormBuilder, Validators } from '@angular/forms';
import { ShareModule } from '../../shared/share.module';

@Component({
  selector: 'app-create-post',
  imports: [MaterialModule, ShareModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss',
})
export class CreatePostComponent {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  fourFormGroup = this._formBuilder.group({
    fourCtrl: ['', Validators.required],
  });
  fiveFormGroup = this._formBuilder.group({
    fourCtrl: ['', Validators.required],
  });
  sixFormGroup = this._formBuilder.group({
    fourCtrl: ['', Validators.required],
  });
  selectedType: string = '';
  selectType(type: string) {
    this.selectedType = type;
  }
}
