import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'new-reading-page',
    templateUrl: 'new-reading-page.component.html'
})
export class NewReadingPage implements OnInit {

    private newReading: any = {
        html: "This is some test text for the directive..."
    };

    constructor() { }

    ngOnInit() { }
}