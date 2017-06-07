import { EdjiComment } from './datatypes';
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service'

@Injectable()
export class CommentService {

  /*
  Last Modified: 6 June 2017
  */

  constructor(private _auth: AuthService) {
  }

  ngOnInit() {
      
  }
}