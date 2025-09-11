import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MaterialModule} from '../../material.module';
import { RoomModel } from '../../../models/room.model';
import { Router } from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DialogWarningComponent} from '../dialog-warning/dialog-warning.component';
import {Store} from '@ngrx/store';
import {AuthState} from '../../../ngrx/state/auth.state';
import {Observable, Subscription} from 'rxjs';
import {AuthModel} from '../../../models/auth.model';
import * as RoomActions from '../../../ngrx/actions/room.actions';

@Component({
  selector: 'app-card',
  imports: [MaterialModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit, OnDestroy {
  dialog = inject(MatDialog);
  isProfilePage = false;
  idToken$ !: Observable<string>;
  mineProfiles$ !: Observable<AuthModel>;
  mineProfiles: AuthModel = <AuthModel>{};
  idToken: string = '';
  subscription: Subscription[] = [];
constructor(
  private router: Router,
  private store: Store<{
    auth: AuthState
  }>
) {
  this.idToken$ = this.store.select('auth','idToken')
  this.mineProfiles$ = this.store.select('auth', 'mineProfile')

  this.isProfilePage = this.router.url.includes('profile');
  if (this.router.url.includes('home')) {
    this.profileId = '';
  }
}

ngOnInit() {
  this.subscription.push(
    this.idToken$.subscribe(idToken => {
      if (idToken) {
        this.idToken = idToken;
      }
    }),
    this.mineProfiles$.subscribe(mineProfiles => {
      if (mineProfiles.id) {
        this.mineProfiles = mineProfiles
      }
    })
  )
}

ngOnDestroy(): void {
  this.subscription.forEach(subscription => subscription.unsubscribe())
  this.idToken = '';
}

  get canDelete(): boolean {
  if (this.router.url.includes('profile')) {
    return this.currentUserId === this.profileId;
  }
  return false;
}
  @Input() currentUserId: string = '';
  @Input() profileId: string = '';
  @Input() hotel: RoomModel = {} as RoomModel
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN');
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/detail', id], {
      queryParams: {
        hostId: this.hotel.host_id
      }
    });
  }

  openDialog(roomId: string, hostId: string) {
    this.dialog.open(DialogWarningComponent, {
      data: {
        roomId: roomId,
        idToken: this.idToken,
        hostId: hostId,
      },
    });
  }



}
