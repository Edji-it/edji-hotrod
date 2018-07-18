import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.pug',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {

  public players: any[] = [
    {
      name: "Corbin Fonville",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Brennen Hicklin",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: ":rocket:",
      book: "Hitchiker's Guide to the Galaxy"
    },
    {
      name: "Cynder Hicklin-Pumper",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: ":tennis:",
      book: "Clifford the Big Red Dog"
    },
    {
      name: "Josh Kyburz",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Cody Pumper",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Kelvin Stewart",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Will Stewart",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
