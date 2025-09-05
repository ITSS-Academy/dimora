import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MaterialModule} from '../../material.module';
import {ShareModule} from '../../share.module';
import {FormControl, FormGroup} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {map, Observable, startWith, Subscription} from 'rxjs';
import {MatDateRangePicker} from '@angular/material/datepicker';
import {MatMenuTrigger} from '@angular/material/menu';
import {Store} from '@ngrx/store';
import {AuthState} from '../../../ngrx/state/auth.state';
import {AuthModel} from '../../../models/auth.model';
import * as AuthActions from '../../../ngrx/actions/auth.actions';
import {MatDialog} from '@angular/material/dialog';
import {Dialog} from '@angular/cdk/dialog';
import {DialogLoginComponent} from '../dialog-login/dialog-login.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchModel } from '../../../models/search.model';
import * as SearchActions from '../../../ngrx/actions/search.actions';
import { RoomModel } from '../../../models/room.model';
import { SearchState } from '../../../ngrx/state/search.state';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import {FilterDialogComponent} from '../filter-dialog/filter-dialog.component';

export interface User {
  name: string;
  image: string;
}
@Component({
  selector: 'app-header',
  imports: [MaterialModule, ShareModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [provideNativeDateAdapter()],
})


export class HeaderComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  searchData: SearchModel | null = null
  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  @ViewChild('guestsMenu') guestsMenu!: MatMenuTrigger;
  mineProfile$ !: Observable<AuthModel>;
  minDate = new Date();
  subscriptions: Subscription[] = [];
  searchResult$ !: Observable<RoomModel[]>;
  isSearchPage: boolean = false;
  options: User[] = [
    {
      name: 'Mary',
      image:'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png'
    },
    {
      name: 'Shelley',
      image:'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D'
    },
    {
      name: 'Igor',
      image:'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg'
    }
  ];
  filteredOptions!: Observable<User[]>;
  constructor(
    private store: Store<{
      auth: AuthState,
      search: SearchState,
    }>,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: SnackbarService
  ) {

    this.mineProfile$ = this.store.select('auth', 'mineProfile');
    this.searchResult$ = this.store.select('search','searchRooms');

  }




  openDialog() {
    this.dialog.open(DialogLoginComponent, {
      minWidth: '800px',
      maxWidth: '100%',
    });
  }

  onLocationInputClick() {

    // Nếu picker đang mở thì đóng nó trước
    if (this.picker.opened) {
      
      this.picker.close();
      // Đợi một chút để overlay biến mất hoàn toàn
      setTimeout(() => {
        this.locationInput.nativeElement.focus();
      }, 100);
    } else {
      this.locationInput.nativeElement.focus();
    }
  }

  onGuestsInputClick() {
    

    // Đóng date picker nếu đang mở
    if (this.picker.opened) {
      
      this.picker.close();
    }
  }

  onSearch() {
    let searchData: SearchModel = {} as SearchModel;

    // Check if we have location from form or from searchData (when navigating from other pages)
    const location = this.range.value.location || this.searchData?.location;
    
    if(location){
      const formattedStartDate = this.formatDateToString(this.range.value.start || new Date());
      const formattedEndDate = this.formatDateToString(this.range.value.end || null);
      
      let newValueGuests = this.range.value.guests?.replace('guests', '').replace('guest', '').trim();

      this.searchData = {
        location: location,
        checkIn: formattedStartDate,
        checkOut: formattedEndDate,
        guests: Number(newValueGuests),
        minPrice: 0,
        maxPrice: 0,
      };

      this.store.dispatch(SearchActions.searchRooms({searchParams:this.searchData}));
      
      // Navigate to search page with query parameters
      this.router.navigate(['/search'], {
        queryParams: {
          location: this.searchData.location,
          checkIn: this.searchData.checkIn,
          checkOut: this.searchData.checkOut,
          guests: this.searchData.guests
        }
      });

    } else {
      this.snackBar.showAlert('Please select a location', 'error', 3000, 'right','top');
    }
  }

  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .normalize('NFD') // Decompose characters with diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .replace(/[đĐ]/g, 'd') // Replace đ/Đ with d
      .replace(/\s+/g, '') // Remove all spaces
      .toLowerCase(); // Convert to lowercase
  }




  // Format Date to yyyy-mm-dd string
  formatDateToString(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onFormKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      
      // Use setTimeout to ensure form value is updated
      setTimeout(() => {
        this.onSearch();
      }, 0);
    }
  }



  range = new FormGroup({
    location: new FormControl<string | null>(null),
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    guests: new FormControl<string>(''),
  });

  // Guest counts
  adults: number = 1;
  children: number = 0;
  infants: number = 0;
  pets: number = 0;

  displayFn(user: User | string): string {
    if (typeof user === 'string') {
      return user;
    }
    return user && user.name ? user.name : '';
  }

  ngOnInit() {
   this.subscriptions.push(
    
  )

    // Check current route to show/hide filter button
    this.checkCurrentRoute();



    // Subscribe to route changes
    this.subscriptions.push(
      this.router.events.subscribe(() => {
        this.checkCurrentRoute();
        this.loadSearchParamsFromURL();
      })
    );

    this.filteredOptions = this.range.controls.location.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );

    // Subscribe to location changes to update searchData
    this.subscriptions.push(
      this.range.controls.location.valueChanges.subscribe(location => {
        if (location && typeof location === 'string') {
          if (!this.searchData) {
            this.searchData = {} as SearchModel;
          }
          this.searchData = { ...this.searchData, location };
        }
      })
    );

    // Initialize guests display
    this.updateGuestsDisplay();
    
    // Load search params from URL on init - delay to ensure form is ready
    setTimeout(() => {
      this.loadSearchParamsFromURL();
      
      // Debug: Check form values after loading
    
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());

  }

  // Check if current route is search page
  checkCurrentRoute(): void {
    this.isSearchPage = this.router.url.includes('/search');
    
    // Clear form values if not on search page
    if (!this.isSearchPage) {
      this.clearSearchForm();
    }
  }

  // Clear all search form values
  private clearSearchForm(): void {
    if (this.range) {
      this.range.patchValue({
        location: '',
        start: null,
        end: null,
        guests: '1 guest'
      });
      
      // Reset guests display
      this.adults = 1;
      this.children = 0;
      this.infants = 0;
      this.pets = 0;
      this.updateGuestsDisplay();
      
      // Clear searchData
      this.searchData = null;
      
    }
  }

  // Load search parameters from URL query params
  loadSearchParamsFromURL(): void {
    // Only load params if on search page
    if (!this.isSearchPage) {
      return;
    }
    
    const queryParams = this.route.snapshot.queryParams;
    
    // Check if form is ready
    if (!this.range || !this.range.controls.location) {
      return;
    }
    
    if (queryParams['location']) {
      // Set location to form control
      
      // Set value as string directly to avoid autocomplete issues
      this.range.controls.location.setValue(queryParams['location']);
      
      // Update searchData with location
      if (!this.searchData) {
        this.searchData = {} as SearchModel;
      }
      this.searchData = { ...this.searchData, location: queryParams['location'] };
      
      
    }
    
    if (queryParams['checkIn']) {
      const checkInDate = new Date(queryParams['checkIn']);
      if (!isNaN(checkInDate.getTime())) {
        this.range.controls.start.setValue(checkInDate);
        
        // Update searchData with checkIn
        if (!this.searchData) {
          this.searchData = {} as SearchModel;
        }
        this.searchData = { ...this.searchData, checkIn: queryParams['checkIn'] };
      }
    }
    
    if (queryParams['checkOut']) {
      const checkOutDate = new Date(queryParams['checkOut']);
      if (!isNaN(checkOutDate.getTime())) {
        this.range.controls.end.setValue(checkOutDate);
        
        // Update searchData with checkOut
        queryParams['checkOut'];
        if (!this.searchData) {
          this.searchData = {} as SearchModel;
        }
        this.searchData = { ...this.searchData, checkOut: queryParams['checkOut'] };
      }
    }
    
    if (queryParams['guests']) {
      const guests = Number(queryParams['guests']);
      if (!isNaN(guests)) {
        // Update guests display based on URL params
        this.updateGuestsFromParams(guests);
        
        // Update searchData with guests
        if (!this.searchData) {
          this.searchData = {} as SearchModel;
        }
        this.searchData = { ...this.searchData, guests };
      }
    }
  }

  // Update guests display from URL params
  private updateGuestsFromParams(totalGuests: number): void {
    // Simple logic: assume all are adults if no specific breakdown
    this.adults = totalGuests;
    this.children = 0;
    this.infants = 0;
    this.pets = 0;
    
    this.updateGuestsDisplay();
  }

  // Open filter dialog
  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      height: 'fit-content',
      width: '600px',
      data: { searchData: this.searchData }
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.filters && this.searchData) {
        // Update searchData with new filters
        const updatedSearchData = {
          ...this.searchData,
          ...result.filters
        };
        this.searchData = updatedSearchData;

        // Dispatch search action
        this.store.dispatch(SearchActions.searchRooms({searchParams: updatedSearchData}));

        // Update query params
        this.router.navigate(['/search'], {
          queryParams: {
            location: updatedSearchData.location,
            checkIn: updatedSearchData.checkIn,
            checkOut: updatedSearchData.checkOut,
            guests: updatedSearchData.guests,
            minPrice: updatedSearchData.minPrice,
            maxPrice: updatedSearchData.maxPrice
          }
        });
      }
    });
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  updateGuestsDisplay() {
    const total = this.adults + this.children + this.infants;
    let display = '';

    if (total === 1) {
      display = '1 guest';
    } else {
      display = `${total} guests`;
    }

    if (this.pets > 0) {
      display += `, ${this.pets} pet${this.pets > 1 ? 's' : ''}`;
    }

    //remove 'guests' or 'guest' in display

    this.range.controls.guests.setValue(display);
  }

  // Guest control methods
  increaseAdults(event?: Event) {
    if (event) event.stopPropagation();
    this.adults++;
    this.updateGuestsDisplay();
  }

  decreaseAdults(event?: Event) {
    if (event) event.stopPropagation();
    if (this.adults > 1) {
      this.adults--;
      this.updateGuestsDisplay();
    }
  }

  increaseChildren(event?: Event) {
    if (event) event.stopPropagation();
    this.children++;
    this.updateGuestsDisplay();
  }

  decreaseChildren(event?: Event) {
    if (event) event.stopPropagation();
    if (this.children > 0) {
      this.children--;
      this.updateGuestsDisplay();
    }
  }

  increaseInfants(event?: Event) {
    if (event) event.stopPropagation();
    this.infants++;
    this.updateGuestsDisplay();
  }

  decreaseInfants(event?: Event) {
    if (event) event.stopPropagation();
    if (this.infants > 0) {
      this.infants--;
      this.updateGuestsDisplay();
    }
  }

  increasePets(event?: Event) {
    if (event) event.stopPropagation();
    this.pets++;
    this.updateGuestsDisplay();
  }

  decreasePets(event?: Event) {
    if (event) event.stopPropagation();
    if (this.pets > 0) {
      this.pets--;
      this.updateGuestsDisplay();
    }
  }



  logout() {
    this.store.dispatch(AuthActions.logout());
  }
  navigateToHome() {
    this.router.navigate(['/home']);
  }
  navigateToProfile(id: string) {
    this.router.navigate(['/profile', id]);
  }

  clearSearch() {
    if(!this.isSearchPage) {
      this.range.controls.location.setValue('');
      this.range.controls.start.setValue(null);
      this.range.controls.end.setValue(null);
      this.range.controls.guests.setValue('');
      this.searchData = null;
    }
  }
}
