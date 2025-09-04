import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SearchGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if location parameter exists
    const location = route.queryParams['location'];
    
    if (!location) {
      console.log('SearchGuard: No location parameter found, redirecting to home');
      this.router.navigate(['/']);
      return false;
    }

    console.log('SearchGuard: Location parameter found, allowing access');
    return true;
  }
}
