import { Component, OnInit, OnDestroy } from "@angular/core";
import { MessageToast, MessageService } from "src/app/_services";
import { Observable } from "rxjs";


@Component({
    selector: 'edji-message-toasts',
    templateUrl: './message-toasts.component.pug',
  })
  export class MessageToastsComponent implements OnInit {

    public toasts: MessageToast[] = []
    public toastObservable: Observable<MessageToast[]>
   
    constructor(private _messages: MessageService) {

    }

    ngOnInit() {
        this.toastObservable = this._messages.toastUpdates
    }

    public dismissToast(toastId: string) : void {
        this._messages.dismissToast(toastId)
      }
    
    public toastIconClass(toastType: string) : string {
    let toastTypeMap = {
        'heat-on' : 'icon-vision-flame',
        'heat-off' : 'icon-vision-flame inactive',
        'info' : 'icon-notice'
    }
    return toastTypeMap[toastType] || toastTypeMap['info']
    }

  }