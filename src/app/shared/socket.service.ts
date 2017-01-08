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
        this.url = _auth.getUrl();
     }

    sendMessage(message){
        this.socket.emit('add-message', message);    
    }

    public joinLiveCount(projectId, userId): Observable<any> {
        this.socket = io(this.url);
        
        this.socket.emit('newSession', { id: projectId, user: userId });

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
}