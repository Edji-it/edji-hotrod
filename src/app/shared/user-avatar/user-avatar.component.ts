import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { PublicUser } from '../datatypes';
import { Store, select } from '@ngrx/store';
import { AppState, selectProjectUser } from 'src/app/_reducers';
import { PublicUsersState } from 'src/app/_reducers/user-details.reducers';

// Project Dependencies


@Component({
  selector: 'user-avatar',
  styleUrls: ['./user-avatar.component.scss'],
  templateUrl: './user-avatar.component.pug',
})
export class UserAvatarComponent implements OnInit {
  // Can load with either PublicUser or User id 
  // (ID only supported within Project currently)
  @Input() userId: string
  @Input() userDetails: PublicUser

  public user: any
  public initials: string

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.store.pipe(select(selectProjectUser, { id: this.userId }))
      .subscribe(user => {
        if (user) {
          this.user = user
          this.initials = user.initials
        }
      })
  }

  ngOnDestroy() {

  }
}
