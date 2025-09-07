import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BookingGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Get query parameters
    const queryParams = route.queryParams;
    console.log(queryParams);
    
    // Check if all required parameters are present
    const requiredParams = ['roomId', 'checkIn', 'checkOut', 'adults', 'children', 'infants', 'totalAmount'];
    const missingParams = requiredParams.filter(param => !queryParams[param]);
    
    if (missingParams.length > 0) {
      console.warn('Missing required booking parameters:', missingParams);
      // Redirect to home page if parameters are missing
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate parameter formats
    const roomId = queryParams['roomId'];
    const checkIn = queryParams['checkIn'];
    const checkOut = queryParams['checkOut'];
    const adults = queryParams['adults'];
    const children = queryParams['children'];
    const infants = queryParams['infants'];
    const totalAmount = queryParams['totalAmount'];
    
    // Validate roomId (should be a string)
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      console.warn('Invalid roomId parameter');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate dates (should be valid date strings)
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      console.warn('Invalid date parameters');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate check-out is after check-in
    if (checkOutDate <= checkInDate) {
      console.warn('Check-out date must be after check-in date');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate adults count (should be a positive number)
    const adultsCount = parseInt(adults);
    if (isNaN(adultsCount) || adultsCount <= 0) {
      console.warn('Invalid adults count');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate children count (should be a non-negative number)
    const childrenCount = parseInt(children);
    if (isNaN(childrenCount) || childrenCount < 0) {
      console.warn('Invalid children count');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate infants count (should be a non-negative number)
    const infantsCount = parseInt(infants);
    if (isNaN(infantsCount) || infantsCount < 0) {
      console.warn('Invalid infants count');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // Validate total amount (should be a positive number)
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      console.warn('Invalid total amount');
      this.router.navigate(['/not-found']);
      return false;
    }
    
    // All validations passed
    return true;
  }
}
