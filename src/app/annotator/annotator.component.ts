/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highilghting
 */
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.html'
})
export class AnnotatorComponent implements OnInit {
    private lineExpanded: boolean = false;
    private showCommentCounts: boolean = false;
    private showAllComments: boolean = false;

    constructor() { }

    ngOnInit() { }
}