import { Subscription } from 'rxjs'
import { Component, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core'
import { CopyService, PromoCopy } from '../../_services'

// Project Dependencies

@Component({
  selector: 'promo-banner',
  templateUrl: './promo-banner.component.pug',
  styleUrls: ['./promo-banner.component.scss'],
})
export class PromoBannerComponent implements OnInit, OnDestroy {
  public promo: PromoCopy = {}
  public graphic: string
  private subscriptions: Subscription[] = []
  // Scroll progress inputs for calculation
  // @Input() link: string

  constructor(private _copy: CopyService) {}

  ngOnInit() {
    this.subscriptions.push(
      this._copy.activePromotions.subscribe(promo => {
        if (promo.heading) {
          this.promo = promo
          this.graphic = promo.graphic[0].thumbnails.full.url
        }
      }),
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
