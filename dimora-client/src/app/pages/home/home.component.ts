import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MaterialModule} from '../../shared/material.module';
import {AuthState} from '../../ngrx/state/auth.state';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {AuthModel} from '../../models/auth.model';
import {CardComponent} from '../../shared/components/card/card.component';
import { RoomState } from '../../ngrx/state/room.state';
import { RoomModel } from '../../models/room.model';
import { MapComponent } from "../../shared/components/map/map.component";
import * as RoomActions from '../../ngrx/actions/room.actions';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [MaterialModule, CardComponent,NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('carouselFirstTrack') carouselFirstTrack!: ElementRef;
  @ViewChild('carouselSecondTrack') carouselSecondTrack!: ElementRef;
  @ViewChild('carouselThirdTrack') carouselThirdTrack!: ElementRef;
  @ViewChild('carouselFourthTrack') carouselFourthTrack!: ElementRef;

  currentPosition: number = 0;
  currentPositionSecond: number = 0;
  currentPositionThird: number = 0;
  currentPositionFourth: number = 0;


  currentUser$!: Observable<AuthModel>;
  roomList$!: Observable<RoomModel[]>;
  isLoading$!: Observable<boolean>;
  idToken$ !: Observable<string>
  idToken: string = '';
  subscriptions: Subscription[] = [];

  // Grouped rooms by city
  cityGroups: { city: string; rooms: RoomModel[] }[] = [];
  otherRooms: RoomModel[] = [];
  




  maxPosition: number = 0;
  maxPositionSecond: number = 0;
  maxPositionThird: number = 0;
  maxPositionFourth: number = 0;
  
  constructor(
    private store: Store<{
      auth: AuthState,
      room: RoomState
    }>,
  ) {

    this.idToken$ = this.store.select('auth', 'idToken');
    this.currentUser$ = this.store.select('auth', 'currentUser')
    this.roomList$ = this.store.select('room', 'roomList');
    this.isLoading$ = this.store.select('room', 'isLoading');
    this.store.dispatch(RoomActions.getRoomList());

  }


  dummyHotel = [
    {
      name: 'A',
      price: 1000,
      imageUrl:'https://a0.muscache.com/im/pictures/hosting/Hosting-1389166206163296493/original/0b10a40f-2d41-4f9e-9b05-35f0eb749fa4.jpeg?im_w=1200'
    },
    {
      name: 'B',
      price: 2000,
      imageUrl:'https://a0.muscache.com/im/pictures/hosting/Hosting-1397818122061442655/original/973571a4-2be4-4249-846b-ba06b8edec17.jpeg?im_w=1200'
    },
    {
      name: 'C',
      price: 2500,
      imageUrl:'https://a0.muscache.com/im/pictures/c5b245db-cbd8-48b5-9440-ffe9d7e6aced.jpg?im_w=1200'
    },
    {
      name: 'D',
      price: 2900,
      imageUrl:'https://a0.muscache.com/im/pictures/hosting/Hosting-1389547927852518257/original/bda2073d-1ca6-45ed-8bf1-589aeb12c032.jpeg?im_w=1200'
    },
    {
      name: 'E',
      price: 3200,
      imageUrl:'https://a0.muscache.com/im/pictures/miso/Hosting-906165232867801008/original/7db8c8bb-ea79-42cb-a5bd-0ab48aa65e60.jpeg?im_w=1200'
    },
    {
      name: 'F',
      price: 3700,
      imageUrl:'https://a0.muscache.com/im/pictures/miso/Hosting-906165232867801008/original/df82ba79-a76c-44ed-b7a4-da2533257ff1.jpeg?im_w=720'
    },
    {
      name: 'G',
      price: 3900,
      imageUrl:'https://a0.muscache.com/im/pictures/miso/Hosting-906165232867801008/original/535153c0-0e97-43fa-a7ad-ee020a38c173.jpeg?im_w=720'
    },
    {
      name: 'H',
      price: 4100,
      imageUrl:'https://a0.muscache.com/im/pictures/miso/Hosting-906165232867801008/original/cde16abf-e757-4d03-84ee-b901a6b5234b.jpeg?im_w=720'
    },
    {
      name: 'I',
      price: 4500,
      imageUrl:'https://a0.muscache.com/im/pictures/miso/Hosting-1323262218926645792/original/0ab5019c-4cd9-4804-98e4-c71ed7e2011b.jpeg?im_w=1200'
    },
    {
      name: 'J',
      price: 4700,
      imageUrl:'https://a0.muscache.com/im/pictures/miso/Hosting-1323262218926645792/original/547da722-c0a5-48e5-8b96-132a8d60ceca.jpeg?im_w=720'
    },

  ]


  ngOnInit() {
    this.subscriptions.push(
    this.idToken$.subscribe((idToken: string) => {
      if (idToken) {
        console.log('ID Token:', idToken);
        this.idToken = idToken;
        }
      }),

    this.roomList$.subscribe((roomList: RoomModel[]) => {
      if (roomList && roomList.length > 0) {
        console.log('Room List:', roomList);
        this.groupRoomsByCity(roomList);
        
        // Update max positions after data is grouped
        setTimeout(() => {
          this.updateAllMaxPositions();
        }, 100);
      }
    }),
  )

    setTimeout(() => {
      this.updateAllMaxPositions();
      window.addEventListener('resize', this.updateAllMaxPositions.bind(this));
    }, 0);

  }

  // Update max positions for all carousels
  updateAllMaxPositions() {
    this.updateMaxPosition('first');
    this.updateMaxPosition('second');
    this.updateMaxPosition('third');
    this.updateMaxPosition('fourth');
  }

  // Generic method to calculate max position for any carousel
  updateMaxPosition(carouselType: 'first' | 'second' | 'third' | 'fourth') {
    let track: ElementRef;
    let maxPosition: number;

    switch(carouselType) {
      case 'first':
        track = this.carouselFirstTrack;
        maxPosition = this.maxPosition;
        break;
      case 'second':
        track = this.carouselSecondTrack;
        maxPosition = this.maxPositionSecond;
        break;
      case 'third':
        track = this.carouselThirdTrack;
        maxPosition = this.maxPositionThird;
        break;
      case 'fourth':
        track = this.carouselFourthTrack;
        maxPosition = this.maxPositionFourth;
        break;
    }

    if (!track?.nativeElement) return;

    const trackElement = track.nativeElement;
    const cards = trackElement.querySelectorAll('app-card');

    if (cards.length === 0) return;

    // Get actual card width and gap
    const cardWidth = cards[0].offsetWidth;
    const gap = 29; // From CSS gap: 30px
    
    // Get container width (parent of track)
    const containerWidth = trackElement.parentElement?.offsetWidth || window.innerWidth;

    // Calculate how many cards can fit in the container
    const cardsPerView = Math.floor(containerWidth / (cardWidth + gap));

    // Calculate total scrollable width
    const totalCardsWidth = cards.length * (cardWidth + gap);
    const maxScrollWidth = Math.max(0, totalCardsWidth - containerWidth + gap);

    // Update the corresponding maxPosition
    switch(carouselType) {
      case 'first':
        this.maxPosition = maxScrollWidth;
        break;
      case 'second':
        this.maxPositionSecond = maxScrollWidth;
        break;
      case 'third':
        this.maxPositionThird = maxScrollWidth;
        break;
      case 'fourth':
        this.maxPositionFourth = maxScrollWidth;
        break;
    }
    
    console.log(`${carouselType} carousel: ${cards.length} cards, maxPosition: ${maxScrollWidth}`);
  }

  // Generic scroll method
  scrollCarousel(carouselType: 'first' | 'second' | 'third' | 'fourth', direction: 'left' | 'right') {
    let track: ElementRef;
    let currentPos: number;
    let maxPos: number;

    switch(carouselType) {
      case 'first':
        track = this.carouselFirstTrack;
        currentPos = this.currentPosition;
        maxPos = this.maxPosition;
        break;
      case 'second':
        track = this.carouselSecondTrack;
        currentPos = this.currentPositionSecond;
        maxPos = this.maxPositionSecond;
        break;
      case 'third':
        track = this.carouselThirdTrack;
        currentPos = this.currentPositionThird;
        maxPos = this.maxPositionThird;
        break;
      case 'fourth':
        track = this.carouselFourthTrack;
        currentPos = this.currentPositionFourth;
        maxPos = this.maxPositionFourth;
        break;
    }

    if (!track?.nativeElement) return;

    const trackElement = track.nativeElement;
    const cards = trackElement.querySelectorAll('app-card');

    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 29;
    const scrollDistance = cardWidth + gap;

    let newPosition: number;

    if (direction === 'left') {
      newPosition = Math.max(0, currentPos - scrollDistance);
    } else {
      newPosition = Math.min(maxPos, currentPos + scrollDistance);
    }

    // Update the corresponding position
    switch(carouselType) {
      case 'first':
        this.currentPosition = newPosition;
        break;
      case 'second':
        this.currentPositionSecond = newPosition;
        break;
      case 'third':
        this.currentPositionThird = newPosition;
        break;
      case 'fourth':
        this.currentPositionFourth = newPosition;
        break;
    }

    trackElement.style.transform = `translateX(-${newPosition}px)`;
  }

  // Individual scroll methods for backward compatibility
  scroll(direction: string) {
    this.updateMaxPosition('first');
    this.scrollCarousel('first', direction as 'left' | 'right');
  }

  scrollSecond(direction: string) {
    this.updateMaxPosition('second');
    this.scrollCarousel('second', direction as 'left' | 'right');
  }

  scrollThird(direction: string) {
    this.updateMaxPosition('third');
    this.scrollCarousel('third', direction as 'left' | 'right');
  }

  scrollFourth(direction: string) {
    this.updateMaxPosition('fourth');
    this.scrollCarousel('fourth', direction as 'left' | 'right');
  }

  // Group rooms by city
  private groupRoomsByCity(roomList: RoomModel[]): void {
    // Reset arrays
    this.cityGroups = [];
    this.otherRooms = [];
    
    // Reset carousel positions
    this.currentPosition = 0;
    this.currentPositionSecond = 0;
    this.currentPositionThird = 0;
    this.currentPositionFourth = 0;

    // Group rooms by city
    const cityMap = new Map<string, RoomModel[]>();
    
    roomList.forEach(room => {
      const city = room.city || 'Unknown';
      if (!cityMap.has(city)) {
        cityMap.set(city, []);
      }
      cityMap.get(city)!.push(room);
    });

    // Convert to array and sort by room count (descending)
    const cityArray = Array.from(cityMap.entries())
      .map(([city, rooms]) => ({ city, rooms }))
      .sort((a, b) => b.rooms.length - a.rooms.length);

    // Take cities with at least 3 rooms, prioritize by room count
    let remainingRooms: RoomModel[] = [];
    
    cityArray.forEach(({ city, rooms }) => {
      if (rooms.length >= 3) {
        if (this.cityGroups.length < 3) {
          this.cityGroups.push({ city, rooms });
        } else {
          // If we already have 3 groups, check if this city has more rooms
          // Find the group with least rooms to potentially replace
          const minGroupIndex = this.cityGroups.reduce((minIndex, group, index) => 
            group.rooms.length < this.cityGroups[minIndex].rooms.length ? index : minIndex, 0);
          
          if (rooms.length > this.cityGroups[minGroupIndex].rooms.length) {
            // Replace the group with least rooms
            const replacedGroup = this.cityGroups[minGroupIndex];
            remainingRooms = remainingRooms.concat(replacedGroup.rooms);
            this.cityGroups[minGroupIndex] = { city, rooms };
          } else {
            // Add to remaining
            remainingRooms = remainingRooms.concat(rooms);
          }
        }
      } else {
        // Cities with less than 3 rooms go to remaining
        remainingRooms = remainingRooms.concat(rooms);
      }
    });

    // Put remaining rooms in the 4th group
    this.otherRooms = remainingRooms;

    console.log('Total cities found:', cityArray.length);
    console.log('Cities with >= 3 rooms:', cityArray.filter(c => c.rooms.length >= 3).length);
    console.log('City Groups:', this.cityGroups.map(g => `${g.city} (${g.rooms.length} rooms)`));
    console.log('Other Rooms count:', this.otherRooms.length);
  }

  // Get rooms for specific carousel
  getRoomsForCarousel(index: number): RoomModel[] {
    if (index < this.cityGroups.length) {
      return this.cityGroups[index].rooms;
    } else if (index === 3) {
      return this.otherRooms;
    }
    return [];
  }

  // Get city name for carousel title
  getCityNameForCarousel(index: number): string {
    if (index < this.cityGroups.length) {
      return this.cityGroups[index].city;
    } else if (index === 3) {
      return 'Other Locations';
    }
    return '';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
