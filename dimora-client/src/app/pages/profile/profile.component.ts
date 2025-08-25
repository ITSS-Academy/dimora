import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {ScheduleComponent} from './schedule/schedule.component';
import {MaterialModule} from '../../shared/material.module';
import {Store} from '@ngrx/store';
import {AuthService} from '../../services/auth/auth.service';
import {AuthState} from '../../ngrx/state/auth.state';
import {Observable} from 'rxjs';
import {AuthModel} from '../../models/auth.model';
import {AsyncPipe, NgOptimizedImage} from '@angular/common';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {ActivatedRoute} from '@angular/router';
import * as AuthActions from '../../ngrx/actions/auth.actions';

@Component({
  selector: 'app-profile',
  imports: [
    MatTab,
    MatTabGroup,
    ScheduleComponent,
    MaterialModule,
    AsyncPipe,
    LoadingComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  currentProfile$ !: Observable<AuthModel>
  isLoading$ !: Observable<boolean>
  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<{
    auth: AuthState,
  }>) {
    this.activatedRoute.params.subscribe(params => {
      const userId = params['id'];

      this.store.dispatch(AuthActions.getUserById({id: userId}))
      // You can use the userId to fetch user-specific data if needed
    })

    this.currentProfile$ = this.store.select('auth','currentUser')
    this.isLoading$ = this.store.select('auth','isLoading')


  }



}
