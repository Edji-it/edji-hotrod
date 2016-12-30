import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
    
    constructor(private _readings: ReadingService, private router: Router, fb: FormBuilder, private el: ElementRef) {
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
    extractTextNodes(element: any, ancestorTags ?: string[]) {
        let tagName = element.tagName;
        let nodes = element.childNodes;
        
        // Children should inherit tags from several elements up
        // eg. "B" style should propagate down
        if (ancestorTags) {
            ancestorTags.push(tagName);
        } else {
            let ancestorTags = [tagName];
        }

        for (let node of nodes) {
            if (node.nodeType === 3) {
                // Found a text node!

                // Split text inside child nodes
                let nodeWords = node.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el){ return el.replace(/([\n])/g, ''); } );  
                
                // If empty element, push a spacer word to reflect that
                if (nodeWords.length < 1) {
                    this.words.push({
                        str: '',
                        styles: [tagName, 'space', 'first', 'last']
                    });
                }

                // Otherwise loop through words, and process into array
                nodeWords.forEach((nodeWord, index) => {
                    let word = {
                        str : nodeWord,
                        styles: []
                    };
                    if (word.str.trim().length < 1) {
                        word.styles.push('space');
                    }
                    if (index == 0) {
                        word.styles.push('first');
                    }
                    if (index == nodeWords.length - 1) {
                        word.styles.push('last');
                    }
                    word.styles.push(tagName);
                    this.words.push(word);
                });
            } else {
                // If not a text node, dig deeper for text nodes
                this.extractTextNodes(node, ancestorTags);
            }
        }
    }

    /**
     * Runs on form submit, and processes reading before calling service
     *  @param form Passed from the HTML form element
     */
    onSubmit(form) {
        // Set submitted to show form errors
        this.submitted = true;

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

        console.log(this.words);

        // Create reading object to submit based on form object parameter
        let reading: any = form;
        reading.html = this.readingHtml;
        reading.words = this.words;

        this._readings.save(reading)
            .subscribe(
                data => {
                    console.log(data);
                    if (data._id) {
                        this.router.navigate(['reading', data._id]);
                    }
                },
                error => {
                    console.log(error)
                }
            );
    }
}