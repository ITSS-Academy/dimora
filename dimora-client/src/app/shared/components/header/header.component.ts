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
import { Router } from '@angular/router';
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
    console.log('locationInput clicked');

    // Nếu picker đang mở thì đóng nó trước
    if (this.picker.opened) {
      console.log('Picker is already opened, closing it');
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
    console.log('guestsInput clicked');

    // Đóng date picker nếu đang mở
    if (this.picker.opened) {
      console.log('Closing date picker');
      this.picker.close();
    }
  }

  onSearch() {
    console.log('Search button clicked');
    console.log('Form values:', this.range.value);

    let searchData: SearchModel = {} as SearchModel;

    // Format dates to yyyy-mm-dd string
    if(this.range.value.location ){
      const formattedStartDate = this.formatDateToString(this.range.value.start || null);
      const formattedEndDate = this.formatDateToString(this.range.value.end || null);

      console.log('Formatted start date:', formattedStartDate);
      console.log('Formatted end date:', formattedEndDate);
      let newValueGuests = this.range.value.guests?.replace('guests', '').replace('guest', '').trim();

      // Normalize location - remove Vietnamese accents and spaces
      const normalizedLocation = this.normalizeText(this.range.value.location);

      searchData = {
        location: normalizedLocation,
        checkIn: formattedStartDate,
        checkOut: formattedEndDate,
        guests: Number(newValueGuests),
        minPrice: 0,
        maxPrice: 0,
      };

    console.log('Search data with formatted dates:', searchData);
    this.store.dispatch(SearchActions.searchRooms({searchParams:searchData}));

    // Navigate to search page with query parameters
    this.router.navigate(['/search'], {
      queryParams: {
        location: searchData.location,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests
      }
    });

    }else{
      this.snackBar.showAlert('Please select a location', 'error', 300000, 'right','top');
    }


  }

  // Normalize text - remove Vietnamese accents and spaces
  normalizeText(text: string): string {
    if (!text) return '';

    return text
      .normalize('NFD') // Decompose characters with diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
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
    // Chặn phím Enter để ngăn form submit
    if (!this.range.value.location && event.key === 'Enter') {
      console.log(this.range.value.location)
      event.preventDefault();
      event.stopPropagation();
      console.log('Enter key blocked - please use Search button');
    }else if(this.range.value.location && event.key === 'Enter'){
      // Navigate to search page with query parameters
      const formattedStartDate = this.formatDateToString(this.range.value.start || null);
      const formattedEndDate = this.formatDateToString(this.range.value.end || null);
      let newValueGuests = this.range.value.guests?.replace('guests', '').replace('guest', '').trim();
      const normalizedLocation = this.normalizeText(this.range.value.location);

      this.router.navigate(['/search'], {
        queryParams: {
          location: normalizedLocation,
          checkIn: formattedStartDate,
          checkOut: formattedEndDate,
          guests: Number(newValueGuests)
        }
      });
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

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  ngOnInit() {
   this.subscriptions.push(
    this.mineProfile$.subscribe(profile => {
      if (profile) {
        console.log('User profile loaded:', profile);
      } else {
        console.log('No user profile available');
      }
    }),
  )

    // Check current route to show/hide filter button
    this.checkCurrentRoute();

    // Subscribe to route changes
    this.subscriptions.push(
      this.router.events.subscribe(() => {
        this.checkCurrentRoute();
      })
    );

    this.filteredOptions = this.range.controls.location.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );

    // Initialize guests display
    this.updateGuestsDisplay();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());

  }

  // Check if current route is search page
  checkCurrentRoute(): void {
    this.isSearchPage = this.router.url.includes('/search');
  }

  // Open filter dialog
  openFilterDialog(): void {
    this.dialog.open(FilterDialogComponent);
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
}
