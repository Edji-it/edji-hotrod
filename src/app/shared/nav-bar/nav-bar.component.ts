import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'nav-bar',
  styleUrls: [ './nav-bar.component.scss' ],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
  @Input() public isLarge: boolean;
  @Input() private showLinks: boolean;

  private isMobile = false;

  ngOnInit() {
    if (window.screen.availWidth < 768) {
      this.isMobile = true;
    }
  }
}
