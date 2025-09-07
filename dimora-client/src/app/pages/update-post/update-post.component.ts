import { Component } from '@angular/core';
import {MaterialModule} from '../../shared/material.module';
import {max, min} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {RootCommands} from '@angular/cli/src/commands/command-config';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-update-post',
  imports: [
    MaterialModule,
    FormsModule,
    NgForOf
  ],
  templateUrl: './update-post.component.html',
  styleUrl: './update-post.component.scss'
})
export class UpdatePostComponent {
  foods: any;
  formatLabel: ((value: number) => string) | undefined;
  disabled: unknown;

  protected readonly max = max;
  protected readonly min = min;
  step: unknown;
  thumbLabel: unknown;
  showTicks: unknown;
  value: any;
  protected readonly length = length;
  Quantity: any;
  protected readonly GainNode = GainNode;
  protected readonly RootCommands = RootCommands;
  Guests: any;
  Rooms: any;
  Beds: any;
  Bathrooms: any;
  uploadedImages: string[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
