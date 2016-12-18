import { Observable, Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { ReadingService } from '../shared/reading.service';

@Component({
    // moduleId: module.id,
    selector: 'edji-reading-page',
    styleUrls: ['reading-page.component.scss'],
    templateUrl: 'reading-page.component.html',
    providers: [
        ReadingService
    ]
})
export class ReadingPageComponent implements OnInit, OnDestroy {
    private readingId: any;
    private reading: any = {};
    private subscriptions: Subscription[] = [];

    constructor(private _route: ActivatedRoute, private _readings: ReadingService) {
        this.subscriptions.push(
            this._route.params
            .subscribe((params: Params) => { 
                if(params['id']){
                    this.readingId = params['id'];
                    this.getReading(this.readingId);
                }
            })
        );
    }

    ngOnInit() {
 
    }

    getReading(readingId) {
        this.subscriptions.push(
            this._readings.get(readingId)
                .subscribe(
                    data => {
                        this.reading = data.json();
                    },
                    err => {
                        console.log(err);
                    })
        )
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}