import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';

@Component({
    selector: 'new-reading-page',
    styleUrls: ['new-reading-page.component.scss'],
    templateUrl: 'new-reading-page.component.html'
})
export class NewReadingPage implements OnInit {
    
    private readingForm: FormGroup;
    private readingHtml: string = "<div>&nbsp;</div>";
    private readingIsBlank: boolean = false;
    private readingPlaceholder: string = 'Type or paste your reading...';
    private submitted: boolean = false;
    private addLoading: boolean = false;
    private error: string = '';
    private showUploadModal: boolean = false;
    private isDraft: boolean = true;

    // Used for processing reading
    private words: any[] = [];

    // Configuration Options for Medium Editor
    private mediumEditorConfig: any = {
        imageDragging: false, 
        paste : { 
            forcePlainText : true,
            cleanPastedHTML: true,
            cleanAttrs: ['class', 'style', 'dir', 'href'],
            cleanTags: ['meta', 'button', 'input', 'form', 'img', 'label', 'pre', 'figure']
        }, 
        extensions: { 
            imageDragging: {}
        }, 
        toolbar: {
            buttons: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3']
        }
    };
    
    constructor(
        private _readings: ReadingService,
        private _projects: ProjectService,
        private router: Router,
        private angulartics: Angulartics2,
        fb: FormBuilder,
        private el: ElementRef
    ) {
        this.readingForm = fb.group({
            title: [null, Validators.required],
            source: [null, null],
            label: ['Group 1', Validators.required]
        });
    }

    ngOnInit() {
     }

    /**
     * Loops through child elements to find textnodes
     * Pushes text nodes as formatted objects into this.words
     * @param element Root element to start crawling from
     */
    private extractTextNodes(element: any, ancestorTags ?: string[], lastInBlock ?: boolean) {
        let tagName = 'tagName' in element && element.tagName.toLowerCase();
        let nodes = element.childNodes;
        
        // Children should inherit tags from several elements up
        // eg. "B" style should propagate down
        if (!ancestorTags) {
            ancestorTags = [];
        } 

        if (ancestorTags.indexOf(tagName) < 0) {
            ancestorTags.push(tagName);
        }

        if (tagName === 'img') {
            this.words.push({
                str: '', // to be used for image title
                url: element.getAttribute('src'), 
                styles: ['img']
            });
        }

        for (let index = 0; index < nodes.length; index++) {

            let node = nodes[index];
            // Copy tags array to variable local to loop instance
            let inheritedTags = ancestorTags.slice();
            
            // If the node is just a break
            if ('tagName' in node && node.tagName.toLowerCase() == 'br') {
                console.log('break found!');
                // Add break element
                this.words.push({
                    str: '',
                    styles: ['br']
                });
            }
            
            // Found a text node!
            if (node.nodeType === 3) {

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
                for (let wIndex = 0; wIndex < nodeWords.length; wIndex++) {
                   let nodeWord = nodeWords[wIndex];
                    let word = {
                        str : nodeWord,
                        styles: [].concat(inheritedTags)
                    };
                    let addBr = false;
                    if (typeof(word.str) == 'string' && word.str.trim().length < 1) {
                        word.styles.push('space');
                    }
                    if (index == 0 && wIndex == 0) {
                        word.styles.push(tagName + '-a');
                    }
                    if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
                        word.styles.push(tagName + '-z');
                        if (tagName == 'p' || tagName == 'h1' || tagName == 'h2' || tagName == 'h3') {
                            addBr = true;
                        }
                        if (lastInBlock === true) {
                            addBr = true;
                        }
                    }
                    this.words.push(word);
                    if (addBr) {
                        // Add break element
                        this.words.push({
                            str: '',
                            styles: ['br']
                        });
                    }
                }
            } else {
                // If not a text node, dig deeper for text nodes
                if ( index == nodes.length - 1 && (tagName == 'p' || tagName == 'h1' || tagName == 'h2' || tagName == 'h3')) {
                    this.extractTextNodes(node, inheritedTags, true);
                } else {
                    this.extractTextNodes(node, inheritedTags);
                }
            }
        }
    }

    /**
     * Runs on form submit, and processes reading before calling service
     *  @param form Passed from the HTML form element
     */
    private onSubmit(form) {
        // Set submitted to show form errors
        this.submitted = true;
        this.addLoading = true;
        this.error = '';

        // Custom empty validation for reading content
        if (this.el.nativeElement.querySelector('medium-editor').innerText.trim().length > 0 || this.el.nativeElement.querySelectorAll('medium-editor img').length > 0) {
            this.readingIsBlank = false;
        } else {
            this.readingIsBlank = true;
        }

        // This would be better handled by formcontrols
        if (!form.title || form.title.length < 1 || this.readingIsBlank || form.label.length < 1) {
            this.addLoading = false;
            this.error = 'Not quite, please check all the fields!';
            return;
        }
        
        this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'attempt' }});

        // Clear parsed words array
        this.words = [];

        // Process reading html into useful Words Array
        let editorHtml = this.el.nativeElement.querySelector('#angularMediumEditor');
        let childEls = editorHtml.childNodes;

        // Loop through all Reading html elements
        for (let childEl of childEls) {
            this.extractTextNodes(childEl);
        }

        // Create reading object to submit based on form object parameter
        let reading: any = form;
        reading.html = this.readingHtml;
        reading.words = this.words;

        // If the reading is not being saved as a draft (A.K.A. it's a final version)
        if (this.isDraft===false) {
            reading.draft = false;
        }
        
        this._readings.save(reading)
            .subscribe(
                data => {
                    if (data._id) {
                        this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'success' }});
                        
                        // Create default Project
                        this._projects.create(data._id, { 'label' : form.label, 'types' : ['emoji','text'] })
                            .subscribe( (project) => {
                                this.addLoading = false;
                                this.router.navigate(['project', project._id]);
                            }, (error) => {
                                console.log(error);
                                this.addLoading = false;
                            })
                    }
                },
                error => {
                    console.log(error);
                    this.addLoading = false;
                    this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'failure' }});
                }
            );
    }

    private addImage(imageUrl: string) {
        console.log(imageUrl);
        this.readingHtml += '<img src="' + imageUrl + '" /><br/><p></p>';
    }
}