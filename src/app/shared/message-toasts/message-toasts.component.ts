import { Component, OnInit, Input } from '@angular/core'
import { Observable } from 'rxjs'

// Project Dependencies
import { MessageToast, MessageService } from 'src/app/_services'
import { Router } from '@angular/router'
@Component({
  selector: 'edji-message-toasts',
  templateUrl: './message-toasts.component.pug',
})
export class MessageToastsComponent implements OnInit {
  @Input() currentPage: string

  public toasts: MessageToast[] = []
  public toastObservable: Observable<MessageToast[]>

  constructor(private _messages: MessageService, public _router: Router) {}

  ngOnInit() {
    this.toastObservable = this._messages.toastUpdates
  }

  public dismissToast(toastId: string): void {
    this._messages.dismissToast(toastId)
  }

  public toastIconClass(toastType: string): string {
    let toastTypeMap = {
      'heat-on': 'icon-vision-flame',
      'heat-off': 'icon-vision-flame inactive',
      success: 'icon-check',
      info: 'icon-notice',
      promo: 'icon-gift',
      'new-feedback': 'icon-feedback',
    }
    return toastTypeMap[toastType] || toastTypeMap['info']
  }

  /**
   * if we have a link property on the toast, either navigate to the linked route
   * or if it's feedback, we'll set it up to scroll in to view
   * @param toast is the active toast
   */
  public linkToAttribute(toast: MessageToast): void {
    // jump to route if we have the link property on toast
    if (toast.link) {
      let link = toast.link
      if (toast.id == 'feedback') {
        const fbEl = document.querySelector("[name='#fb-" + toast.link + "']")
        fbEl.scrollIntoView({ behavior: 'smooth' })
        return
      }
      this._router.navigate([link])
    }
  }
}
