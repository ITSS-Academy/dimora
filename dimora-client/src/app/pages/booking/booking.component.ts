import { Component } from '@angular/core';
import {MaterialModule} from '../../shared/material.module';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-booking',
  imports: [MaterialModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {

}
