import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

declare var window: any

@Component({
  selector: 'app-promo',
  templateUrl: './promo.component.pug',
  styleUrls: ['./promo.component.scss']
})
export class PromoPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.embedRafflecopter()
  }

  private embedRafflecopter() {
    // Rafflecopter Embed Code
    let doc = window.document
    let script = doc.createElement('script')
    let firstScript = doc.getElementsByTagName("script")[0]
    script.src = "//widget-prime.rafflecopter.com/launch.js"
    // Config
    let n = {}
    let i: any = {}
    var o={_configs:n,config:function(window,e){n[window]=e},_logins:i,login:function(t,e){i.creds=window,i['callback']=e}};window['cptr']&&window['cptr'].widget||(window['cptr']=window['cptr']||{},window['cptr'].widget=o)
    firstScript.parentNode.insertBefore(script, firstScript)
  }
}
