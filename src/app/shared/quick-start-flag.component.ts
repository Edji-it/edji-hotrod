import { Component, Input } from "@angular/core";

@Component({
    selector: 'quick-start-flag',
    template: `
        <div class="hover--tooltip" [ngClass]="[isCornerTrigger ? 'corner-trigger':'alert__icon-wrap']">
            <div class="icon icon-flag"></div>
            <div class="tooltip-wrap">
                <div class="tooltip">
                    <div class="tooltip-title">Quick-start guide!</div>
                </div>
            </div> 
        </div>
    `,
    styles: [`
        .corner-trigger {
            position: fixed;
            right: 25px;
            bottom: 15px;
            z-index: 9000;
            opacity: 0.8;
            cursor: pointer;
            background-color: #8ed9ff5c;
            width: 32px;
            height: 32px;
            font-size: 21px;
            text-align: center;
            border-radius: 50%;
            line-height: 28px;
            border: 1px solid #bee5ebdd;
        }
        .corner-trigger:hover {
            opacity: 1;
            border-color: #bee5eb;
            background-color: #8ed9ff;
        }
        .corner-trigger .icon {
            vertical-align: middle;
        }
    `]
  })
  export class QuickStartFlagComponent {
      @Input() isCornerTrigger: boolean

    constructor() {

    }
  }