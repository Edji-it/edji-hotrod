import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { AuthService } from './auth.service';

@Injectable()
export class SocketService {

    private url;  
    private socket;

    constructor(private _auth: AuthService) {
        if (this._auth.getEnv() === "prod") {
            this.url = "http://bluestreak.edji.it";
        } else {
            // this.url = 'http://localhost:7899';
            this.url = "http://bluestreak-dev.edji.it";
        }
        this.socket = io(this.url);
    }

    /**
     * Handles the live reading count on the project page
     */
    public joinLiveCount(projectId, userId): Observable<any> {
        this.socket.emit('openProject', { id: projectId, user: userId });

        return this.liveUsersCount();
    }

    public liveUsersCount(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('liveUsers', (liveCount) => {
                observer.next(liveCount);    
            });
            return () => {
                this.socket.disconnect();
            };  
        })     
        return observable;
    }

    public commentUpdates(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('updateComment', (commentUpdate) => {
                console.log("got updated comment");
                observer.next(commentUpdate);    
            });
            return () => {
                this.socket.disconnect();
            };  
        })     
        return observable;
    }

    /**
     * Tell Student Views, Heat Vision has been toggled
     */
    public heatVisionUpdates(): Observable<any> {
        console.log("got a subscriber");
        let observable = new Observable(observer => {
            this.socket.on('heatVision', (heatToggle) => {
                console.log("got heat toggle");
                observer.next(heatToggle);    
            });
            return () => {
                this.socket.disconnect();
            };  
        })     
        return observable;
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