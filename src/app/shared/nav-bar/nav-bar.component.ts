import { Component, Input } from '@angular/core';

@Component({
  selector: 'nav-bar',
  styleUrls: [ './nav-bar.component.scss' ],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent {
  @Input()
  public isLarge: boolean;
  @Input()
  private showLinks: boolean;

  ngOnInit() {
    
  }
}
