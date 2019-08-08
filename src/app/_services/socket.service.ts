import { Injectable } from '@angular/core'
import * as io from 'socket.io-client'
import { Observable, Subject } from 'rxjs'

import { AuthService } from './auth.service'
import { userReadingStatus } from '../shared/datatypes';

@Injectable()
export class SocketService {
  private url: any
  private socket: any

  // User count observable
  private userCount: any[] = []
  private newLiveUsers: any[] = []
  private userCountSubj: Subject<any> = new Subject()
  public liveUsersCount: Observable<any> = this.userCountSubj.asObservable()

  // Comment Update observable
  private commentSubject: Subject<any> = new Subject()
  public commentUpdates: Observable<any> = this.commentSubject.asObservable()

  // Heat vision observable
  private heatVision: Subject<any> = new Subject()
  public heatVisionUpdates: Observable<any> = this.heatVision.asObservable()

  // Refresh Leaderboard Update observable
  private groupUpdateSubj: Subject<any> = new Subject()
  public groupUpdate: Observable<any> = this.groupUpdateSubj.asObservable()

  constructor(private _auth: AuthService) {
    if (this._auth.getEnv() === 'prod') {
      this.url = '//bluestreak.edji.it'
    } else {
      // this.url = '//localhost:7899';
      this.url = '//bluestreak-dev.edji.it'
    }

    // Ensure we have a socket available
    this.createSocketAndWatch()
  }

  /**
   * Join the Socket room based on the Project ID
   */
  public joinSocketRoom(projectId, userId): void {
    this.createSocketAndWatch()
    this.socket.emit('openProject', { id: projectId, user: userId })
  }

  public leaveRoom(): void {
    this.socket && this.socket.disconnect && this.socket.disconnect()
  }

  private createSocketAndWatch(): void {
    this.leaveRoom()
    // Sockets are destroyed on disconnect, make sure we have a fresh one!
    this.socket = io(this.url)

    // Watch user count
    this.socket.on('liveUsers', liveCount => {
      // Check for users that went offline that were previously online
      const prevUsers = [...this.userCount]
      // check for new users first, change status to active
      this.toggleUserStatus(liveCount, prevUsers, 'active')
      // // check for offline users second, change status to offline
      this.toggleUserStatus(prevUsers, liveCount, 'offline')

      this.userCount = liveCount
      this.userCountSubj.next(liveCount)
    })

    // Watch comment udpates
    this.socket.on('updateComment', commentUpdate => {
      this.commentSubject.next(commentUpdate)
    })

    // Watch heat vision updates
    this.socket.on('heatVision', heatToggle => {
      this.heatVision.next(heatToggle)
    })

    /**
     * Watch any project updates
     * Trigger socket response generically
     */
    this.socket.on('groupUpdate', groupUpdate => {
      this.groupUpdateSubj.next(groupUpdate)
    })
  }

  /**
   * Tell Teacher View to update comment
   * @param comment Comment Object
   * @param updateType 'CREATE', 'DELETE', or 'UPDATE'
   */
  public updateComment(comment: any, updateType: string, projectId: string): void {
    // Verify comment object before passing on
    if (comment._id) {
      this.socket.emit('updateComment', { comment: comment, action: updateType, projectId: projectId })
    }
  }

  public toggleHeatVision(heatToggle: PowerToggle) {
    let projectPowers = {
      heatVision: heatToggle,
    }
    this.socket.emit('heatVision', projectPowers)
  }

  /**
   * groupUpdateEvent: Generic handling of group sockets for flexibility
   * @param groupUpdate must have property 'type' as a string to declare type of socket response
   * remaining values can be passed as additional properties but must be defined in socket listener locations for proper response handling
   */
  public groupUpdateEvent(groupUpdate: any): void {
    this.socket.emit('groupUpdate', groupUpdate)
  }

  /**
   * Works in 2 directions, based on statusChange
   * @param userList1 socket room user list -- either the previous list or the current
   * @param userList2 socket room user list -- either the previous list or the current
   * @param statusChange set the status to either active or offline
   *  - active: sets user to active if they weren't previously in the socket room, but are in it now
   *  - offline: sets user to offline if they were in the socket room previously, but are not now
   */
  private toggleUserStatus(userList1: any[], userList2: any[], statusChange: userReadingStatus): void {
    const len1 = userList1.length
    const len2 = userList2.length
    let newListCheck: any
    let foundUser: any

    // loop through all socket room userId's
    for (let i = 0; i < len1; i++) {
      let user1 = userList1[i]
      // check the previous users list (if empty, that means we're initializing the project)
      if (len2 > 0) {
        foundUser = userList2.find((user2) => {
          return user1.userId === user2.userId
        })
      } else {
        // this happens when the project is first loaded, so all of the users in the list are considered new live users
        this.newLiveUsers = [...userList1]
      }

      // if we're checking for new users and found an outlier, add it to this list so we skip over the check for offline outliers
      if (!foundUser && statusChange == 'active' && len2 > 0) {
        this.newLiveUsers.push(foundUser)
      }

      // when checking to see who left the room, check against those that are joining the reading that weren't here previously first
      // that way we do not unintentionally mark the user as offline when they are actually active
      if (statusChange == 'offline' && this.newLiveUsers.length > 0) {
        newListCheck = this.newLiveUsers.find((newUser) => {
          return user1.userId === newUser && newUser.userId
        })
      }
      // if the user wasn't previously in the list -> set the status to active
      // if the user was in the previous list and isn't now -> set status to offline
      if (!foundUser && !newListCheck) {
        this.changeUserStatus(user1, statusChange)
      }
      // reset these to undefined so we don't have a logic fallacy
      foundUser = undefined
      newListCheck = undefined
    }
  }

  /**
   * Convenience method to update the user's status -- either active or offline here
   * @param liveUser is our current user from the socket room and contains the user _id as userId
   * @param status the status we're going to broadcast out via sockets
   */
  private changeUserStatus(liveUser: any, status: userReadingStatus) {
    this.groupUpdateEvent({
      type: 'updateUserStatus',
      status: status,
      user: { _id: liveUser.userId }
    })
  }
}

export interface PowerToggle {
  all?: boolean
  userId?: string
}
