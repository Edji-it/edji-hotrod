import { Injectable } from '@angular/core'

// Project dependencies
import { MessageService } from './message.service'
import { Store } from '@ngrx/store'
import { AppState } from '../_reducers'
import { getMetricsComments } from '../_reducers/metrics.reducers'

/**
 * Localstorage wrapper
 * - Uses Angular Safeguard
 * - Provides the cleanest interface possible and consolidates storage configuration (eg. using LOCAL)
 */
@Injectable({
  providedIn: 'root',
})
export class BadgeService {

    private commentBadge = {
            metric: 'comments_created',
            current: 0,
            needed: 47,
            subscription: null,
            toast: {
                type: 'first-comment',
                id: 'firstcomment',
                message: '<b></b><br/>Boom! First comment<br/>',
                requireDismiss: true
            }
    }

    private readingBadge = {
        metric: 'readings_created',
        current: 0,
        needed: 1,
        subscription: null,
        toast: {
          message: '<b>Success, first reading created</b><br/>Collaboration awaits!',
          id: 'guide',
          type: 'first-reading',
          limitToPage: 'project',
          requireDismiss: true
        }
    }

    constructor(private _message: MessageService, private store: Store<AppState>) {
        this.store.select(getMetricsComments)
            // .filter(action => action.type === 'ADD_STORY_SUCCESS')
            .subscribe(newCount => {
                console.log('Badge got:', newCount)
                if (newCount >= this.commentBadge.needed) {
                    this._message.sendToast(this.commentBadge.toast)
                }
                this.commentBadge.current = newCount
            });
    }

    public announce() {

    }
}