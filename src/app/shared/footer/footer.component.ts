import { Mock } from 'protractor/built/driverProviders';
import { Map } from 'rxjs/util/Map';
import { BrowserXhr } from '@angular/http';
import { Component, OnInit } from '@angular/core';

declare var window: any

@Component({
  selector: 'footer',
  styleUrls: [ './footer.component.scss' ],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  private appVersion;
  private window
  private browserProperties: any

  constructor() {
    this.window = window
  }

  ngOnInit() {
    var w = this.window.navigator
    // Set a message and the following properties to return:
    // Device
    // Browser
    // Browser Version
    // Edji Version
    this.browserProperties = '%0A%0A' + "We're going to do our best to help you! Please don't delete this information, we'll use it to resolve your problem. Thanks for hanging in there while we get this resolved!" 
    + '%0A%0A%0A%0A%0A' + w.platform + '%0A' + this.getBrowser(w.userAgent) + '%0A' + this.getBrowserVersion(w.userAgent) + '%0A' + this.getEdjiVersion()
  }

  getBrowser(sUsrAg) {
    if(sUsrAg.indexOf("Chrome") > -1) {
        return "Google Chrome";
    } else if (sUsrAg.indexOf("Safari") > -1) {
        return "Apple Safari";
    } else if (sUsrAg.indexOf("Opera") > -1) {
        return "Opera";
    } else if (sUsrAg.indexOf("Firefox") > -1) {
        return "Mozilla Firefox";
    } else if (sUsrAg.indexOf("MSIE") > -1) {
        return "Microsoft Internet Explorer";
    }
  }


  getBrowserVersion(sUsrAg) {
    var M, temp

    M = sUsrAg.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if(/trident/i.test(M[1])){
        temp = /\brv[ :]+(\d+)/g.exec(sUsrAg) || [];
        return 'IE '+ (temp[1] || '');
    }

    if(M[1] === 'Chrome'){
        temp = sUsrAg.match(/\b(OPR|Edge)\/(\d+)/);
        if(temp != null) return temp.slice(1).join(' ').replace('OPR', 'Opera');
    }

    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];

    if((temp = sUsrAg.match(/version\/(\d+)/i)) != null) M.splice(1, 1, temp[1]);

    return M.join(' ');
  }

  getEdjiVersion() {
    return document.getElementById('buildNumber').innerHTML.trim()
  }
}
