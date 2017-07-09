import { EdjiComment } from './datatypes';
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service'
import { ProjectService, ReadingService, SocketService } from './';
import { Angulartics2 } from 'angulartics2/dist';

@Injectable()
export class CommentService {

  /*
  Last Modified: 6 June 2017
  */

  constructor(
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService,
        private _socket: SocketService,
        private angulartics: Angulartics2
      ) {
  }

  ngOnInit() {
      
  }
}