import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-detail',
  imports: [],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {

  constructor(private route: ActivatedRoute,) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        console.log('Detail ID:', params['id']);
      }
    });
  }

}
