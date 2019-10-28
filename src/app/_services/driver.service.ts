import { Injectable } from "@angular/core";
import * as Driver from 'driver.js'

// Project Dependencies
import { AnalyticsService } from "./analytics.service";

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    private driver: Driver
    private tourName: string = ''
    private tourStep: number = 1

    constructor(private _analytics: AnalyticsService) {
        // Set up global driver
        this.driver = new Driver({
          opacity: 0.5,
          padding: 20,
          overlayClickNext: true, // prevents overlay close click
          doneBtnText: 'Done',
          closeBtnText: 'Skip',
          onHighlightStarted: (driverEl) => {
            /**
             * Special handling for nav bar buttons:
             * - nav-bar becomes absolutely positioned for highlight
             * - Page must be scrolled up to see nav bar
             */
            let node = driverEl.getNode()
            if (node['classList'] && node['classList'] .contains('nav-bar__btn')) {
                window.scrollTo(0,0)
            }
          },
          onNext: (driverEl) => {
            this.tourStep++
            this.reportStep()
          },
          onPrevious: (driverEl) => {
            this.tourStep--
            this.reportStep()
          }
        })
    }

    private reportStep(): void {
        this._analytics.event(`onboarding_${this.tourName}_step${this.tourStep}`)
    }

    /**
     * Define steps and begin tour
     * @note call once elements are rendered on page
     * @param steps tour steps
     * @param tourName used for analytics reporting
     */
    public beginTour(steps: DriverStep[], tourName?: string): void {
        // Set tour name for reporting
        this.tourName = tourName || ''
        this.tourStep = 1
        this.driver.defineSteps(this.processSteps(steps))
        // Begin driver after latest render
        setTimeout(() => {
            this.driver.start()
        })   
    }

    /**
     * Clear and end any current tour
     */
    public endTour(): void {
        if (this.driver && this.driver.isActivated) {
            this.driver.reset()
        }
    }

    private processSteps(steps: DriverStep[]): Driver.Step[] {
        let stepTotal = steps.length
        return steps.map((step, index) => {
            // Handle empty descriptions
            if (!step.popover.description) { 
                step.popover.description = '' 
            }
            //<br/>
            step.popover.description += this.buildPagingDots(stepTotal, index)
            // Clean up
            return <Driver.Step>step
        })
    }

    private buildPagingDots(count, index) {
        let dotHtml: string = '<center>'
        for (let i = 0; i < count; i++) {
            if (i === index) {
                dotHtml += `<div class="tooltip-pager__dot active"></div>`
            } else {
                dotHtml += `<div class="tooltip-pager__dot"></div>`
            }
        }
        // Additionally attach Guide flag
        return dotHtml + `</center><div class="alert__icon-wrap hover--tooltip">
            <div class="icon icon-flag"></div>
            <div class="tooltip-wrap">
                <div class="tooltip">
                    <div class="tooltip-title">Quick-start guide!</div>
                </div>
            </div> 
        </div>`
    }
}

export interface DriverStep {
    element: string               // Query selector string or Node to be highlighted
    popover: {                    // There will be no popover if empty or not given
      className?: string          // className to wrap this specific step popover in addition to the general className in Driver options
      title: string               // Title on the popover
      description?: string        // Body of the popover
      position?: string           // top, left, right, center, top-center, etc.
      showButtons?: boolean       // Do not show control buttons in footer
      closeBtnText?: string       // Text on the close button for this step
      nextBtnText?: string        // Next button text for this step
      prevBtnText?: string        // Previous button text for this step
    }
}