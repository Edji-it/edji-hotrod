import { Subscription } from 'rxjs/Rx';
import { Component, EventEmitter, OnInit, Input } from '@angular/core';

@Component({
  selector: 'loading-component',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

    /*
        19 August 2017
        Nick Pumper
        Last Mod: 19 Aug 2017

        Insert this if you need a loading symbol.
    */

    @Input()
    public loadingStatus : boolean = true;

    constructor () {}

    ngOnInit() {
        
    } // ngOnInit() 

    public getLoadingStatus () : boolean {
        // console.log("Are we loading? " + this.loadingStatus);
        return this.loadingStatus;
    }
} // Loading class 