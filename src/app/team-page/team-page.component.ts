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
      title: "CEO",
      photo: "/assets/images/promo/headshot-corbin.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Brennen Hicklin",
      title: "Customer Success",
      photo: "/assets/images/promo/headshot-brennen.jpg",
      emoji: ":rocket:",
      book: "Hitchiker's Guide to the Galaxy"
    },
    {
      name: "Cynder Hicklin-Pumper",
      title: "Branch Manager",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: ":tennis:",
      book: "Clifford the Big Red Dog"
    },
    {
      name: "Josh Kyburz",
      title: "Hacker",
      photo: "/assets/images/promo/headshot-josh.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Cody Pumper",
      title: "Product Design",
      photo: "/assets/images/promo/headshot-cody.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Kelvin Stewart",
      title: "Assistant to the Branch Manager",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    },
    {
      name: "Will Stewart",
      title: "",
      photo: "/assets/images/promo/headshot-cynder.jpg",
      emoji: "",
      book: ""
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
