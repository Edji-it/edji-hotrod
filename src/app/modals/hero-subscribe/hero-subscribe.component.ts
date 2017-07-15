import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'hero-subscribe-modal',
  templateUrl: './hero-subscribe.component.html',
  styleUrls: ['./hero-subscribe.component.scss']
})
export class HeroSubscribeComponent implements OnInit {

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter(); // Tell the listening page to close the darned thing.
  
  constructor() { }

  ngOnInit() {
  }

}