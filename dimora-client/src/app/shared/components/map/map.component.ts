import {Component, ViewChild} from '@angular/core';
import {GoogleMap, MapMarker} from '@angular/google-maps';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-map',
  imports: [ GoogleMap, MapMarker, DecimalPipe],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {

}
