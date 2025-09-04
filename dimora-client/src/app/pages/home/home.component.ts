import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  imports: [MaterialModule, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('carouselFirstTrack') carouselFirstTrack!: ElementRef;
  @ViewChild('carouselSecondTrack') carouselSecondTrack!: ElementRef;
  @ViewChild('carouselThirdTrack') carouselThirdTrack!: ElementRef;
  @ViewChild('carouselFourthTrack') carouselFourthTrack!: ElementRef;

   currentPosition: number = 0;
   currentPositionSecond: number = 0;
   currentPositionThird: number = 0;
  currentPositionFourth: number = 0;
  currentUser$!: Observable<AuthModel>;

   maxPosition: number = 0;
   maxPositionSecond: number = 0;
   maxPositionThird: number = 0;
   maxPositionFourth: number = 0;
  idToken: string = '';
  idToken$ !: Observable<string>
  constructor(
    private store: Store<{
      auth: AuthState
    }>,
  ) {

    this.idToken$ = this.store.select('auth', 'idToken');
    this.currentUser$ = this.store.select('auth', 'currentUser')
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
    this.idToken$.subscribe((idToken: string) => {
      if (idToken) {
        console.log('ID Token:', idToken);
        this.idToken = idToken;
      }
    });

    this.currentUser$.subscribe((user: AuthModel) => {
      if (user.id) {
        console.log('Current User:', user);
      }
    })
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
    const gap = 30; // From CSS gap: 30px
    
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
    const gap = 30;
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

}
