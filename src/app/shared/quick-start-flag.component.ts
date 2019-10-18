import { Component } from "@angular/core";

@Component({
    selector: 'quick-start-flag',
    template: `
        <div class="alert__icon-wrap hover--tooltip">
            <div class="icon icon-flag"></div>
            <div class="tooltip-wrap">
                <div class="tooltip">
                    <div class="tooltip-title">Quick-start guide!</div>
                </div>
            </div> 
        </div>
    `
  })
  export class QuickStartFlagComponent {

    constructor() {

    }
  }