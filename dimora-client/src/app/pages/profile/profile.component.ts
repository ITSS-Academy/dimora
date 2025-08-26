import {Component, inject} from '@angular/core';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { ScheduleComponent } from './schedule/schedule.component';
import { MaterialModule } from '../../shared/material.module';
import { HistoryComponent } from './history/history.component';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogUpdateProfileComponent
} from '../../shared/components/dialog-update-profile/dialog-update-profile.component';

@Component({
  selector: 'app-profile',

  imports: [
    MatTab,
    MatTabGroup,
    ScheduleComponent,
    MaterialModule,
    HistoryComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  dialog = inject(MatDialog);

  profile = {
    name: 'Huy Trần',
    email: 'example.gmail',
    phone: '+84 966442382'
  };


  openDialog() {
    this.dialog.open(DialogUpdateProfileComponent, {
      data: {
        profile: this.profile,
      },
    });
  }


}



