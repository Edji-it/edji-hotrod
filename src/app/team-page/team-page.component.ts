import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { map } from 'rxjs/operators'
@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.pug',
  styleUrls: ['./team-page.component.scss'],
})
export class TeamPageComponent implements OnInit {
  public players: any[] = [
    {
      name: 'Will Stewart',
      title: 'Founding Teacher',
      photo: '/assets/images/promo/headshot-will.jpg',
      emoji: ':sauropod:',
      book: 'All the Pretty Horses',
    },
    {
      name: 'Corbin Fonville',
      title: 'CEO',
      photo: '/assets/images/promo/headshot-corbin.jpg',
      emoji: ':race_car:',
      book: "Ender's Game",
    },
    {
      name: 'Amanda Fonville',
      title: 'Outreach & Teacher Success',
      photo: '/assets/images/promo/headshot-amanda.jpg',
      emoji: ':crown:',
      book: "Scrappy Little Nobody",
    },
    {
      name: 'Brennen Hicklin',
      title: 'Customer Success',
      photo: '/assets/images/promo/headshot-brennen.jpg',
      emoji: ':rocket:',
      book: "Hitchiker's Guide to the Galaxy",
    },
    {
      name: 'Josh Kyburz',
      title: 'Product Development',
      photo: '/assets/images/promo/headshot-josh.jpg',
      emoji: ':fire:',
      book: 'Elon Musk by Ashlee Vance',
    },
    {
      name: 'Cody Pumper',
      title: 'Product Design',
      photo: '/assets/images/promo/headshot-cody.jpg',
      emoji: ':tada:',
      book: 'Ready Player One',
    },
  ]

  public animals: any[] = [
    {
      name: 'Sprocket Fonville',
      title: 'Office Administrator',
      photo: '/assets/images/promo/headshot-sprocket.jpg',
      emoji: ':gear:',
      book: 'Cat in the Hat',
    },
    {
      name: 'Cynder Hicklin-Pumper',
      title: 'Branch Manager',
      photo: '/assets/images/promo/headshot-cynder.jpg',
      emoji: ':tennis:',
      book: 'Clifford the Big Red Dog',
    },
    {
      name: 'Kelvin Stewart',
      title: 'Head of Security',
      photo: '/assets/images/promo/headshot-kelvin.jpg',
      emoji: ':feet:',
      book: 'Outwitting Squirrels',
    },
  ]

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Workaround for handling "jump to" fragment/anchor
    if (this.route.snapshot.fragment) {
      let startEl = document.getElementById(this.route.snapshot.fragment)
      startEl && startEl.scrollIntoView()
    }
  }
}
