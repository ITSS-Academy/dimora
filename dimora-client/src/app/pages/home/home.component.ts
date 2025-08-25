import {Component, OnInit} from '@angular/core';
import {MaterialModule} from '../../shared/material.module';
import * as AuthActions from '../../ngrx/actions/auth.actions';
import {AuthState} from '../../ngrx/state/auth.state';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {AuthModel} from '../../models/auth.model';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {CardComponent} from '../../shared/components/card/card.component';
@Component({
  selector: 'app-home',
  imports: [MaterialModule, LoadingComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  idToken: string = '';
  idToken$ !: Observable<string>
  currentUser$ !: Observable<AuthModel>;
  constructor(
    private store: Store<{
      auth: AuthState
    }>,
  ) {

    this.idToken$ = this.store.select('auth', 'idToken');
    this.currentUser$ = this.store.select('auth', 'currentUser');
  }


  ngOnInit() {
    this.idToken$.subscribe((idToken: string) => {
      if (idToken) {
        console.log('ID Token:', idToken);
        this.idToken = idToken;
      }
    });

    this.currentUser$.subscribe((user: AuthModel) => {
      if (user.uid) {
        console.log('Current User:', user);
      }
    })
  }


  login() {
    this.store.dispatch(AuthActions.login());
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

}
