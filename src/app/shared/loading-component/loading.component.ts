import { Subscription } from 'rxjs/Rx';
import { Component, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'loading-component',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

    /*
        19 August 2017
        Nick Pumper
        Last Mod:

        Insert this if you need a loading symbol.
    */

    public loadingStatus : boolean = false; // should default to false;

    constructor () {}

    ngOnInit() {
        
    } // ngOnInit() 

    // Use this to tell this what in tarnation is happening.
    public inputLoadingStatus (input : boolean) : void {
        console.log("Are we loading? " + input);
    } //  public inputLoadingStatus (input : boolean) : void

    public getLoadingStatus () : boolean {
        return this.loadingStatus;
    }
} // Loading class 