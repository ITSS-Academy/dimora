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
  @ViewChild('carouselSecondTrack') carouselThirdTrack!: ElementRef;

   currentPosition: number = 0;
   currentPositionSecond: number = 0;
  currentUser$!: Observable<AuthModel>;

   maxPosition: number = 0;
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
      const track = this.carouselFirstTrack.nativeElement;
      const cardWidth = track.querySelector('app-card')?.offsetWidth || 250;
      console.log('Card:', cardWidth);
      const gap = 20;
      this.maxPosition = (this.dummyHotel.length - 3.4) * (cardWidth);
    }, 0);

  }



  scroll(direction: string) {
    const track = this.carouselFirstTrack.nativeElement;
    const cardWidth = track.querySelector('app-card')?.offsetWidth || 250;
    const gap = 16;
    const totalWidth = cardWidth + gap;

    if (direction === 'left') {
      this.currentPosition = Math.max(0, this.currentPosition - totalWidth); // Giới hạn vị trí về 0
    } else if (direction === 'right') {
      this.currentPosition = Math.min(this.maxPosition, this.currentPosition + totalWidth); // Giới hạn vị trí tối đa
      console.log(this.currentPosition)
    }

    track.style.transform = `translateX(-${this.currentPosition}px)`;
  }


  scrollSecond(direction: string) {
    const track = this.carouselSecondTrack.nativeElement;
    const cardWidth = track.querySelector('app-card')?.offsetWidth || 250;
    const gap = 16;
    const totalWidth = cardWidth + gap;

    if (direction === 'left') {
      this.currentPositionSecond = Math.max(0, this.currentPositionSecond - totalWidth); // Giới hạn vị trí về 0
    } else if (direction === 'right') {
      this.currentPositionSecond = Math.min(this.maxPosition, this.currentPositionSecond + totalWidth); // Giới hạn vị trí tối đa
      console.log(this.currentPositionSecond)
    }

    track.style.transform = `translateX(-${this.currentPositionSecond}px)`;
  }

  scrollThird(direction: string) {
    const track = this.carouselSecondTrack.nativeElement;
    const cardWidth = track.querySelector('app-card')?.offsetWidth || 250;
    const gap = 16;
    const totalWidth = cardWidth + gap;

    if (direction === 'left') {
      this.currentPositionSecond = Math.max(0, this.currentPositionSecond - totalWidth); // Giới hạn vị trí về 0
    } else if (direction === 'right') {
      this.currentPositionSecond = Math.min(this.maxPosition, this.currentPositionSecond + totalWidth); // Giới hạn vị trí tối đa
      console.log(this.currentPositionSecond)
    }

    track.style.transform = `translateX(-${this.currentPositionSecond}px)`;
  }

}
