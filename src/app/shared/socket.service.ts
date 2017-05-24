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

        // Ensure we have a socket available
        this.socket = io(this.url)
    }

    /**
     * Join the Socket room based on the Project ID
     */
    public joinSocketRoom(projectId, userId): void {
        // Sockets are destroyed on disconnect, make sure we have a fresh one!
        this.socket = io(this.url)
        this.socket.emit('openProject', { id: projectId, user: userId })
    }

    public leaveRoom(): void {
        this.socket.disconnect()
    }

    public liveUsersCount(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('liveUsers', (liveCount) => {
                observer.next(liveCount);    
            });
            return () => {
                
            };  
        })
        return observable;
    }

    public commentUpdates(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('updateComment', (commentUpdate) => {
                observer.next(commentUpdate);    
            });
            return () => {
                
            };  
        })     
        return observable;
    }

    /**
     * Tell Student Views, Heat Vision has been toggled
     */
    public heatVisionUpdates(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('heatVision', (heatToggle) => {
                observer.next(heatToggle);    
            });
            return () => {
                
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