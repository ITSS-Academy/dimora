import {Component, Input} from '@angular/core';
import {MaterialModule} from '../../material.module';
import { RoomModel } from '../../../models/room.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [MaterialModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

constructor(private router: Router) {}

  @Input() hotel: RoomModel = {} as RoomModel
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN');
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/detail', id], {
      queryParams: {
        hostId: this.hotel.host_id
      }
    });
  }

}
