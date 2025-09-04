import {Component, Input} from '@angular/core';
import {MaterialModule} from '../../material.module';
import { RoomModel } from '../../../models/room.model';

@Component({
  selector: 'app-card',
  imports: [MaterialModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

  @Input() hotel: RoomModel = {} as RoomModel

}
