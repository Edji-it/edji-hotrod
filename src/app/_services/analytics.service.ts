import { Injectable } from "@angular/core"
import { AuthService } from ".";
import { Angulartics2 } from "angulartics2";

@Injectable({
    providedIn: 'root',
  })
  export class AnalyticsService {
  
    constructor(private _auth: AuthService, private angulartics: Angulartics2) {}

    /**
     * 
     * @param action GA action, example strings:
     * "joinedReading_open"
     * "comment_textOnImageSpot_create"
     * "navBar_sliderToggle_heat"
     * @param label specific value being manipulation, such as id or element
     */
    public event(action: string, label?: string): void {
        // Default label to user, school, or version
        label = label || this._auth.setAnalyticEventLabel()
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
            action: action,
            properties: {
                category: this._auth.setAnalyticEventCategory(),
                label: label,
            },
        })
    }
  }