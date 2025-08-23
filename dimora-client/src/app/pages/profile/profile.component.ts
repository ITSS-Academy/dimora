import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {ScheduleComponent} from './schedule/schedule.component';
import {MaterialModule} from '../../shared/material.module';

@Component({
  selector: 'app-profile',
  imports: [
    MatTab,
    MatTabGroup,
    ScheduleComponent,
    MaterialModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

}
