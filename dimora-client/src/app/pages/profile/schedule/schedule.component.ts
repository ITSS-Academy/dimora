import {AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {MaterialModule} from '../../../shared/material.module';
import {MatCalendar} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-schedule',
  imports: [ MaterialModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ScheduleComponent{


}
