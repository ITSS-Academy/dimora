import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { RoomState } from '../ngrx/state/room.state';
import { AuthState } from '../ngrx/state/auth.state';
import * as RoomActions from '../ngrx/actions/room.actions';
import * as AuthActions from '../ngrx/actions/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class DetailGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private store: Store<{room: RoomState, auth: AuthState}>
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const roomId = route.params['id'];
    const hostId = route.queryParams['hostId'];


    // Check if both id and hostId are provided
    if (!roomId || !hostId) {
      console.log('DetailGuard: No roomId or hostId found, redirecting to not-found');
      this.router.navigate(['/not-found']);
      return of(false);
    }

 

    // Allow navigation immediately, let the component handle loading
    return of(true);
  }
}
