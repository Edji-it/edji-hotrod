import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ReadingService } from '../shared/reading.service';

@Component({
    selector: 'new-reading-page',
    templateUrl: 'new-reading-page.component.html'
})
export class NewReadingPage implements OnInit {
    
    private readingForm: FormGroup;
    private readingHtml: string = "";
    private submitted: boolean = false;
    private readingPlaceholder: string = 'Type or paste your reading...';

    // Used for processing reading
    private words: any[] = [];
    
    constructor(
        private _readings: ReadingService,
        private router: Router,
        private angulartics: Angulartics2,
        fb: FormBuilder,
        private el: ElementRef
    ) {
        this.readingForm = fb.group({
            title: [null, Validators.required],
            source: [null, null]
        });
    }

    ngOnInit() { }

    /**
     * Loops through child elements to find textnodes
     * Pushes text nodes as formatted objects into this.words
     * @param element Root element to start crawling from
     */
    private extractTextNodes(element: any, ancestorTags ?: string[]) {
        let tagName = element.tagName.toLowerCase();
        let nodes = element.childNodes;
        
        // Children should inherit tags from several elements up
        // eg. "B" style should propagate down
        if (!ancestorTags) {
            ancestorTags = [];
        } 

        if (ancestorTags.indexOf(tagName) < 0) {
            ancestorTags.push(tagName);
        }

        nodes.forEach((node, index) => {
            // Copy tags array to variable local to loop instance
            let inheritedTags = ancestorTags.slice();

            if (node.nodeType === 3) {
                // Found a text node!

                // Split text inside child nodes
                let nodeWords = node.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el){ return el.replace(/([\n])/g, ''); } );  
                
                // If empty element, push a spacer word to reflect that
                if (nodeWords.length < 1) {
                    this.words.push({
                        str: '',
                        styles: ['space', 'space-first', 'space-last'].concat(inheritedTags)
                    });
                }

                // Otherwise loop through words, and process into array
                nodeWords.forEach((nodeWord, wIndex) => {
                    let word = {
                        str : nodeWord,
                        styles: [].concat(inheritedTags)
                    };
                    if (word.str.trim().length < 1) {
                        word.styles.push('space');
                    }
                    if (index == 0 && wIndex == 0) {
                        word.styles.push(tagName + '-first');
                    }
                    if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
                        word.styles.push(tagName + '-last');
                    }
                    this.words.push(word);
                });
            } else {
                // If not a text node, dig deeper for text nodes
                this.extractTextNodes(node, inheritedTags);
            }
        });
    }

    /**
     * Runs on form submit, and processes reading before calling service
     *  @param form Passed from the HTML form element
     */
    private onSubmit(form) {
        // Set submitted to show form errors
        this.submitted = true;

        this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'attempt' }});

        // This would be better handled by formcontrols
        if (!form.title || form.title.length < 1 || this.readingHtml.length < 1) {
            return;
        }

        // Clear parsed words array
        this.words = [];

        // Process reading html into useful Words Array
        let readingHtml = this.el.nativeElement.querySelector('medium-editor');
        let childEls = readingHtml.childNodes;

        // Loop through all Reading html elements
        for (let childEl of childEls) {
            this.extractTextNodes(childEl);
        }

        // Create reading object to submit based on form object parameter
        let reading: any = form;
        reading.html = this.readingHtml;
        reading.words = this.words;

        this._readings.save(reading)
            .subscribe(
                data => {
                    if (data._id) {
                        this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'success' }});
                        this.router.navigate(['reading', data._id]);
                    }
                },
                error => {
                    // TRACK EXCEPTION
                    console.log(error)
                }
            );
    }
}