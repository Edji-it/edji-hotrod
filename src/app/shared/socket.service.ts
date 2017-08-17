import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { AuthService } from './auth.service';

@Injectable()
export class SocketService {

    private url;  
    private socket;

    // User count observable
    private userCount: Subject<any> = new Subject()
    public liveUsersCount: Observable<any> = this.userCount.asObservable()

    // Comment Update observable
    private commentSubject: Subject<any> = new Subject()
    public commentUpdates: Observable<any> = this.commentSubject.asObservable()

    // Heat vision observable
    private heatVision: Subject<any> = new Subject()
    public heatVisionUpdates: Observable<any> = this.heatVision.asObservable()


    constructor(
        private _auth: AuthService
    ) {
        if (this._auth.getEnv() === "prod") {
            this.url = "//bluestreak.edji.it";
        } else {
            // this.url = '//localhost:7899';
            this.url = "//bluestreak-dev.edji.it";
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

    private createSocketAndWatch() : void {
        this.leaveRoom()
        // Sockets are destroyed on disconnect, make sure we have a fresh one!
        this.socket = io(this.url)

        // Watch user count
        this.socket.on('liveUsers', (liveCount) => {
            this.userCount.next(liveCount)    
        })

        // Watch comment udpates
        this.socket.on('updateComment', (commentUpdate) => {
            this.commentSubject.next(commentUpdate)    
        })

        // Watch heat vision updates
        this.socket.on('heatVision', (heatToggle) => {
            this.heatVision.next(heatToggle)    
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
            this.socket.emit('updateComment', { comment: comment, action: updateType, projectId: projectId });
        }
    }

    public toggleHeatVision(heatToggle: PowerToggle) {
        let projectPowers = {
            'heatVision' : heatToggle
        };
        this.socket.emit('heatVision', projectPowers);
    }
}

export interface PowerToggle {
    all?: boolean;
    userId?: string;
}