import { REPLServer } from 'repl';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';
import * as Rangy from 'rangy';

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
    private addLoadingD: boolean = false;
    private addLoadingP: boolean = false;
    private error: string = '';
    private showUploadModal: boolean = false;
    private isDraft: boolean = true;
    private readingId: any = "";
    private reading: any = {};
    private projects: any[] = [];
    private errorObject = {
        readingError: ""
    };
    private successObject = {
        readingSuccess: ""
    };
    private successAlert: string = "Nice work! This reading draft was successfully saved!";
    private alert: string = '';
    private showAlert: boolean = false;
    private versionId: string = '';
    private ownerId: string;
    private copyId: string = '';
    private static readonly EDITOR_TOOLBAR_Y = 54;
    private editorToolbarY: number = 54;
    private insertNode: any;

    // Used for processing reading
    private words: any[] = [];

    // Configuration Options for Medium Editor
    private mediumEditorConfig: any = {
        imageDragging: false, 
        paste : { 
            forcePlainText : true,
            cleanPastedHTML: true,
            cleanAttrs: ['class', 'style', 'dir', 'href', 'id'],
            cleanTags: ['meta', 'button', 'input', 'form', 'img', 'label', 'pre', 'figure', 'hr'],
            unwrapTags: [ 'strong', 'center', 'a', 'sup', 'sub', 'span', 'small', 'div', 'em', 'footer' ]
        }, 
        extensions: { 
            // Disables Medium Editor handled image dragging
            imageDragging: {}
        }, 
        toolbar: {
            buttons: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3']
        }
    };
    
    constructor(
        private _route: ActivatedRoute,
        private _readings: ReadingService,
        private _projects: ProjectService,
        private router: Router,
        private angulartics: Angulartics2,
        fb: FormBuilder,
        private el: ElementRef
    ) {
        this.readingForm = fb.group({
            title: [null, Validators.required],
            source: [null, null]
            // label: ['Group 1', Validators.required]
        });
    }

    ngOnInit() {
        this.readingId = this._route.snapshot.params['id'];
        
        this.alert = this._route.snapshot.queryParams['successAlert'];
        if (this.alert) {
            this.successObject.readingSuccess = this.alert;
            this.showAlert = true;
        }

        this.copyId = this._route.snapshot.queryParams['copyId'];
        
        if (this.readingId) {
            this.getReading(this.readingId);
        } else if (this.copyId) {
            this.getReading(this.copyId);
        }
     }

     private getReading(readingId: string) {

        this._readings.get(readingId)
            .take(1)
            .subscribe(
                data => {
                    this.reading = data;
                    if (this.reading.html) {
                        this.readingHtml = this.reading.html;
                        //this.readingHtml = '<div>' + this.reading.html + '&nbsp;</div>';
                        //this.el.nativeElement.querySelector('#readingTitle').value = this.reading.title;
                        this.readingForm.patchValue({
                            title: this.reading.title,
                            source: this.reading.source,
                        });
                        this.versionId = this.reading.version_id;
                        if (this.reading.owner_id) {
                            this.ownerId = this.reading.owner_id;
                        }
                    }
                },
                err => {
                    // TRACK EXCEPTION
                    console.log(err);
                })
    }

    /**
     * Checks on the content field's cursor position
     * - Enables inserting images at cursor position
     */
    private contentChange() {
        let sel = Rangy.getSelection()
        
        if (sel.focusNode) {
            let focusNode = sel.focusNode

            if (focusNode && focusNode.getAttribute && focusNode.id == 'angularMediumEditor' && focusNode.querySelector('img')) {
                // If focus is generically on medium editor, it's often caused by cursor inline with a single image, so if there is an image, focus that
                focusNode = focusNode.querySelector('img')
            } else if(focusNode && focusNode.getAttribute && focusNode.id == 'angularMediumEditor') {
                // Otherwise, set focus to the inside of the start of the editor
                focusNode = focusNode.childNodes[0]
            }

            if (typeof focusNode.offsetTop === 'undefined' ) {
                // Text nodes don't provide an offset, so we need to get the parent
                focusNode = focusNode.parentNode
            }

            this.insertNode = focusNode
            this.editorToolbarY = NewReadingPage.EDITOR_TOOLBAR_Y > focusNode.offsetTop ? NewReadingPage.EDITOR_TOOLBAR_Y : focusNode.offsetTop
        }
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
                        if ( this.words.slice(-1) && this.words.slice(-1)['styles'] && this.words.slice(-1)['styles'].indexOf('br') >= 0 ) {
                            // Do nothing
                        } else if (tagName == 'p' || tagName == 'h1' || tagName == 'h2' || tagName == 'h3') {
                            this.words.push({
                                str: '',
                                styles: ['br']
                            });
                        }
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
                if (lastInBlock === true) {
                    this.words.push({
                        str: '',
                        styles: ['br']
                    });
                }
            } else {
                if (lastInBlock === true ) {
                    this.words.push({
                        str: '',
                        styles: ['br']
                    });
                }
                // If not a text node, dig deeper for text nodes
                if ( index == nodes.length - 1 && (tagName == 'p' || tagName == 'h1' || tagName == 'h2' || tagName == 'h3')) {
                    this.extractTextNodes(node, inheritedTags, true);
                } else {
                    this.extractTextNodes(node, inheritedTags);
                }
            }
        }
    }

    private saveReading(event, form) {
        this.isDraft = true
        this.onSubmit(form)
    }

    private shareReading(groupLabel: string, form) {
        // Handle group options passed back from Nav
        form.label = groupLabel
        // No longer draft!
        this.isDraft = false
        this.onSubmit(form)
    }

    /**
     * Runs on form submit, and processes reading before calling service
     *  @param form Passed from the HTML form element
     */
    private onSubmit(form) {
        // Set submitted to show form errors
        this.submitted = true;
        if (this.isDraft===false) {
            this.addLoadingP = true;
        } else {
            this.addLoadingD = true;
        }
        this.error = '';

        // Custom empty validation for reading content
        if (this.el.nativeElement.querySelector('medium-editor').innerText.trim().length > 0 || this.el.nativeElement.querySelectorAll('medium-editor img').length > 0) {
            this.readingIsBlank = false;
        } else {
            this.readingIsBlank = true;
        }

        // This would be better handled by formcontrols
        if (!form.title || form.title.length < 1 || this.readingIsBlank) {
            this.addLoadingD = false;
            this.addLoadingP = false;
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
        let reading: any = Object.assign({},form);
        delete reading.label
        reading.html = this.readingHtml;
        reading.words = this.words;

        // If the reading is not being saved as a draft (A.K.A. it's a final version)
        if (this.isDraft === true) {
            reading.draft = true;
        } else {
            reading.draft = false;
        }
        if (this.readingId!=='') {
            reading._id = this.readingId;
        }
        if (this.versionId) {
            reading.version_id = this.versionId;
        }
        if (this.ownerId) {
            reading.owner_id = this.ownerId;
        }

        this._readings.save(reading)
            .subscribe(
                data => {
                    if (data._id) {
                        this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'success' }});
                        
                        // Create default Project if it is in final version
                        if (reading.draft===false) {
                            this._projects.create(data._id, { 'label' : form.label, 'types' : ['emoji','text'] })
                                .subscribe( (project) => {
                                    this.addLoadingD = false;
                                    this.addLoadingP = false;
                                    this.router.navigate(['project', project._id]);
                                }, (error) => {
                                    console.log(error);
                                    this.addLoadingD = false;
                                    this.addLoadingP = false;
                                });
                        } else {
                            this.addLoadingD = false;
                            this.addLoadingP = false;
                            this.router.navigate(['new-reading/' + data._id], { queryParams: { successAlert: this.successAlert } });
                            this.successObject.readingSuccess = this.successAlert;
                            this.showAlert = true;
                            this.reading.updatedAt = data.updatedAt;
                        }
                    }
                },
                error => {
                    console.log(error);
                    this.addLoadingD = false;
                    this.addLoadingP = false;
                    this.angulartics.eventTrack.next({ action: 'createNewReading', properties: { category: 'contentManagement', label: 'failure' }});
                    this.errorObject.readingError = "There was an issue saving your reading. It may be our fault; please try again";
                }
            );
    }

    /**
     * Takes an html string, and inserts it after a given element
     * @param parent Parent element of referenceNode
     * @param htmlString String of html content
     * @param referenceNode Element to insert after
     */
    private insertAfter(parent: Element, htmlString: string, referenceNode: Element) {
        // Create elements from html string
        let template = document.createElement('template')
        template.innerHTML = htmlString
        // Insert elements after referenceNode
        parent.insertBefore(template.content.firstChild, referenceNode.nextSibling)
        this.insertNode = referenceNode.nextSibling
    }

    /**
     * Takes an array of objects with a title and a url for an Image, formats, then inserts into reading
     * @param images Array of image objects to be inserted
     */
    private addImages(images: { title: string, url: string }[]) {
        if (this.insertNode && this.insertNode.parentNode) {
            // If there is a reference node for cursor position, insert at cursor
            images.forEach(image => {
                let imgString = '<img src="' + image.url + '" title="' + image.title + '" />'
                this.insertAfter(this.insertNode.parentNode, imgString, this.insertNode)
                this.insertAfter(this.insertNode.parentNode, '<br/>', this.insertNode)
                this.insertAfter(this.insertNode.parentNode, '<p></p>', this.insertNode)
            });
        } else {
            // If no reference node (field has not been interacted with) insert image at end
            let imgString = '';
            images.forEach(image => {
                imgString += '<img src="' + image.url + '" title="' + image.title + '" /><br/><p></p>'
            });
            this.readingHtml += imgString
        }
    }

    /**
     * Prototype for a date pipe
     */
    private showDate(isoTime): string {
        let time = new Date(isoTime);
        let now = new Date();
        let one_minute = 1000 * 60;
        let minDiff = Math.abs(Math.ceil((time.getTime() - now.getTime())/(one_minute)));
        let hourDiff;
        let dayDiff;
        let diffText = '';

        if (minDiff > 59) {
            hourDiff = Math.floor(minDiff/60);
            minDiff = minDiff%60;
            
        }

        if (hourDiff > 23) {
            dayDiff = Math.floor(hourDiff/60);
            hourDiff = hourDiff%60;
        }

        if ( typeof(dayDiff) !== 'undefined' ) {
            diffText += dayDiff + " days";
        } else if ( typeof(hourDiff) !== 'undefined' ) {
            diffText += hourDiff + " hours";
        } else if (minDiff < 1) {
            diffText += "less than 1 min";
        } else if (minDiff < 1) {
            diffText += minDiff + " min";
        } else {
            diffText += minDiff + " mins";
        }

        return "Last saved " + diffText + " ago";
    }
}