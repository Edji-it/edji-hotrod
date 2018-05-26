import { UtilToolService } from '../util-tool.service';
import { Mock } from 'protractor/built/driverProviders';
import { BrowserXhr } from '@angular/http';
import { Component, OnInit } from '@angular/core';
const appVersion = require('../../../../package.json').version;

declare var window: any

@Component({
  selector: 'footer',
  styleUrls: [ './footer.component.scss' ],
  templateUrl: './footer.component.pug'
})
export class FooterComponent implements OnInit {
  private appVersion;
  private window
  private browserProperties: any

  constructor(
    public _util: UtilToolService
  ) {
    this.window = window
    this.appVersion = appVersion
  }

  ngOnInit() {
    var w = this.window.navigator
    // Set a message and the following properties to return:
    // Device
    // Browser
    // Browser Version
    // Edji Version
    this.browserProperties = '%0A%0A' + "We're going to do our best to help you! Please don't delete this information, we'll use it to resolve your problem. Thanks for hanging in there while we get this resolved!" 
    + '%0A%0A%0A%0A%0A' + this._util.getPlatform(w) + '%0A' + this._util.getBrowser(w.userAgent) + '%0A' + this._util.getBrowserVersion(w.userAgent) + '%0A' + this._util.getEdjiVersion()
  }
}
