import { Component } from '@angular/core';
import {MaterialModule} from '../../material.module';

@Component({
  selector: 'app-card',
  imports: [MaterialModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

}
