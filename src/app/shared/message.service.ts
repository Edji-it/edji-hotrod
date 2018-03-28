import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import 'rxjs/add/operator/toPromise'
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Angulartics2 } from 'angulartics2'

@Injectable()
export class MessageService {

  constructor(
    private _http: HttpClient,
    private angulartics: Angulartics2
  ) {
    
  }
  
}