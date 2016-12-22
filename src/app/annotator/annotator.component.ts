/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highilghting
 */
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.html',
    styleUrls: ['annotator.component.scss']
})
export class AnnotatorComponent implements OnInit, OnDestroy {
    // Component input
 
    private lineExpanded: boolean = false;
    private showCommentCounts: boolean = false;
    private showAllComments: boolean = false;

    private highlightY = '100px'; 
    private optionsShow = false;

    private words = [
        { str : 'Lorem', style : 'b' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : '' },{ str : ' ' },{ str : 'Impsum', style : 'i' },{ str : 'Lorem', style : 'i' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : '' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : '' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : 'b' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : 'b' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : '' },{ str : ' ' },{ str : 'Impsum', style : 'i' },{ str : 'Lorem', style : 'i' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : '' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : '' },{ str : ' ' },{ str : 'Impsum' },{ str : 'Lorem', style : 'b' },{ str : ' ' },{ str : 'Impsum' }
    ];

    constructor( ) { }
 
    ngOnInit() {
        // Establish bindings
        
    }
    
    ngOnDestroy() {
        
    }

    hideCommentOptions(event) {
        this.optionsShow = false;
    }

    showCommentOptions(event) {
        console.log("See youuu");
        console.log(event);
        this.highlightY = event.clientY + 'px';
        console.log(this.highlightY);
        this.optionsShow = true;
    }
}