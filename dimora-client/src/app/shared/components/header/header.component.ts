import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MaterialModule} from '../../material.module';
import {ShareModule} from '../../share.module';
import {FormControl, FormGroup} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {map, Observable, startWith} from 'rxjs';
import {MatDateRangePicker} from '@angular/material/datepicker';
import {MatMenuTrigger} from '@angular/material/menu';
import {Store} from '@ngrx/store';
import {AuthState} from '../../../ngrx/state/auth.state';
import {AuthModel} from '../../../models/auth.model';
import * as AuthActions from '../../../ngrx/actions/auth.actions';

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


export class HeaderComponent implements OnInit {
  constructor(
    private store: Store<{
      auth: AuthState,
    }>
  ) {

    this.mineProfile$ = this.store.select('auth', 'mineProfile');

  }

  mineProfile$ !: Observable<AuthModel>;



  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  @ViewChild('guestsMenu') guestsMenu!: MatMenuTrigger;

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
    console.log('Location:', this.range.controls.location.value);
    console.log('Start date:', this.range.controls.start.value);
    console.log('End date:', this.range.controls.end.value);
    console.log('Guests:', this.range.controls.guests.value);
    console.log('Guest details:', {
      adults: this.adults,
      children: this.children,
      infants: this.infants,
      pets: this.pets
    });
  }

  onFormKeyDown(event: KeyboardEvent) {
    // Chặn phím Enter để ngăn form submit
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      console.log('Enter key blocked - please use Search button');
    }
  }

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

  range = new FormGroup({
    location: new FormControl<User | null>(null),
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
    this.mineProfile$.subscribe(profile => {
      if (profile) {
        console.log('User profile loaded:', profile);
      } else {
        console.log('No user profile available');
      }
    })


    this.filteredOptions = this.range.controls.location.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );

    // Initialize guests display
    this.updateGuestsDisplay();
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

  login() {
    this.store.dispatch(AuthActions.login());
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
