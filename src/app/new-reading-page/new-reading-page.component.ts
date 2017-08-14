import { Title } from '@angular/platform-browser';
import { REPLServer } from 'repl';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';
import { AuthService } from '../shared';
import { EdjiComment, EdjiQuestion, User } from '../shared/datatypes'
import { ReadingShareObject } from './../shared/nav-bar'
import * as Rangy from 'rangy';

@Component({
    selector: 'new-reading-page',
    styleUrls: ['new-reading-page.component.scss'],
    templateUrl: 'new-reading-page.component.html'
})
export class NewReadingPage implements OnInit {
    readingTracking(index: any, item: any) {
        return index
    }
    
    /*
        New Reading Page
        Last Mod: 5 Aug 2017
        Create a new reading!
    */

    private readingForm     : FormGroup
    private newReadingInner : string = "<div>&nbsp;</div>"
    private readingHtml     : any[] = [{'text': this.newReadingInner}]
    private concatHtml      : string = ""
    private readingIsBlank  : boolean = false
    private submitted       : boolean = false
    private addLoadingD     : boolean = false
    private addLoadingP     : boolean = false
    private isDraft         : boolean = true
    private readingId       : any = ""
    private reading         : any = {}
    private projects        : any[] = []
    private questions       : any[] = []

    // Trigger booleans
    private showAlert       : boolean = false
    private showUploadModal : boolean = false // Should the modal appear?
    
    private errorObject = {
        readingError: ""
    };
    
    private successObject = {
        readingSuccess: ""
    };

    // Messages
    private successAlert    : string = "Nice work! This reading draft was successfully saved!"
    private readingPlaceholder: string = 'Type or paste your reading...'
    private error           : string = '' // Error message 
    private alert           : string = ''

    private versionId       : string = ''
    private ownerId         : string
    private copyId          : string = ''
    private editorToolbarY  : number = 54
    private editorToolbarHidden : boolean
    private insertNode      : any
    private masterSelection : any
    private currentUser     : User // User data of the current user.

    private static readonly EDITOR_TOOLBAR_Y = 54

    // Used for processing reading
    private words: any[] = []

    // Configuration Options for Medium Editor
    private mediumEditorConfig: any = {
        imageDragging: false, 
        paste : { 
            forcePlainText : true,
            cleanPastedHTML: true,
            cleanAttrs: ['class', 'style', 'dir', 'id'],
            cleanTags: ['meta', 'button', 'input', 'form', 'img', 'label', 'pre', 'figure', 'hr', 'iframe'],
            unwrapTags: [ 'strong', 'center', 'sup', 'sub', 'span', 'small', 'div', 'em', 'footer' ]
        }, 
        extensions: { 
            // Disables Medium Editor handled image dragging
            imageDragging: {}
        }, 
        toolbar: {
            buttons: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3', {
                'name' : 'anchor',
                'contentDefault' : '&nbsp;'
                }]
        }
    }

    // Tutorial variables
    private guideContent: any[] = [
        {
            title: "Use Formatting Styles",
            image: "/assets/guide/newReading__format.gif",
            body: "Select text in your Reading Content to use the formatting bar. Add bold, italic, or header styles to make your content pop!"
        },
        {
            title: "Add Images and PDFs",
            image: "/assets/guide/newReading__insert.png",
            body: "PDFs and Images can be inserted into Readings, simply use the Insert bar on the left. Learn more in <a class='link' href='http://guide.edji.it/index.php/2017/05/09/customizing-your-lessons-with-edji-pdf-uploads/' target='_blank'>our PDF guide</a> and in <a class='link' href='http://guide.edji.it/index.php/2017/05/06/customizing-your-lessons-with-edji-images/' target='_blank'>our Image guide</a>."
        },
        {
            title: "Share your Reading",
            image: "/assets/guide/newReading__share.gif",
            body: "Click Share when finished and name your first Group to get a code&mdash;don't worry, you can create more Groups later!"
        }
    ]
    private guideStepNo: number = 1
    
    constructor(
        private _route: ActivatedRoute,
        private _readings: ReadingService,
        private _projects: ProjectService,
        private router: Router,
        private angulartics: Angulartics2,
        fb: FormBuilder,
        private el: ElementRef,
        private _title: Title,
        private _auth: AuthService
    ) {
        this.readingForm = fb.group({
            title: [null, Validators.required],
            source: [null, null]
            // label: ['Group 1', Validators.required]
        });

        // Define the user object.
        this.currentUser = this._auth.getUser()
    } // constructor

    ngOnInit() {
        this.readingId = this._route.snapshot.params['id']
        
        this.alert = this._route.snapshot.queryParams['successAlert']
        if (this.alert) {
            this.successObject.readingSuccess = this.alert
            this.showAlert = true
        }

        this.copyId = this._route.snapshot.queryParams['copyId']
        
        if (this.readingId) {
            this.getReading(this.readingId)
        } else if (this.copyId) {
            this.getReading(this.copyId)
        }

        this._title.setTitle('Edji | New Reading')
     }

     private getReading(readingId: string) {

        this._readings.get(readingId)
            .take(1)
            .subscribe(
                data => {
                    this.reading = data;
                    if (this.reading.html) {
                        if (this.reading.html.indexOf("<$question$>") !== -1) {
                            this.populateDraftContent(this.reading.html)
                        } else {
                            this.readingHtml[0].text = this.reading.html
                        }
                        //this.readingHtml = '<div>' + this.reading.html + '&nbsp;</div>'
                        //this.el.nativeElement.querySelector('#readingTitle').value = this.reading.title
                        this.readingForm.patchValue({
                            title: this.reading.title,
                            source: this.reading.source,
                        });
                        this.versionId = this.reading.version_id;
                        if (this.reading.owner_id) {
                            this.ownerId = this.reading.owner_id;
                        }

                        this._title.setTitle('Edji | Editing: '+ this.reading.title)
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
        this.masterSelection = sel
        
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

            if (focusNode.parentNode && focusNode.parentNode.id !== 'angularMediumEditor' 
                && focusNode.parentNode.parentNode && focusNode.parentNode.parentNode.id !== 'angularMediumEditor') {
                this.editorToolbarHidden = true
            } else {
                this.editorToolbarHidden = false
            }

            this.insertNode = focusNode
            this.editorToolbarY = NewReadingPage.EDITOR_TOOLBAR_Y > focusNode.offsetTop ? NewReadingPage.EDITOR_TOOLBAR_Y : focusNode.offsetTop
        } else {
            this.editorToolbarHidden = true
        }
    }

    /**
     * Returns appropriate placeholder text based on ReadingHtml array index
     */
    private getReadingPlaceholder(textIndex: number) : string {
        if (textIndex == 0) {
            return this.readingPlaceholder
        } else {
            return ' '
        }
    }

    /**
     * Loops through child elements to find textnodes
     * Pushes text nodes as formatted objects into this.words
     * @param element Root element to start crawling from
     */
    private extractTextNodes(element: any, ancestorTags ?: string[], lastInBlock ?: boolean) {
        let tagName = 'tagName' in element && element.tagName.toLowerCase()
        let nodes = element.childNodes
        
        // Children should inherit tags from several elements up
        // eg. "B" style should propagate down
        if (!ancestorTags) {
            ancestorTags = []
        } 

        if (ancestorTags.indexOf(tagName) < 0) {
            ancestorTags.push(tagName)
        }

        if (tagName === 'img') {
            this.words.push({
                str: '', // to be used for image title
                url: element.getAttribute('src'), 
                styles: ['img']
            })
        }

        if (tagName === 'a') {
            this.words.push({
                str: element.innerText, // to be used for image title
                url: element.getAttribute('href'), 
                styles: ['a']
            })
            nodes = []
        }

        for (let index = 0; index < nodes.length; index++) {

            let node = nodes[index]
            // Copy tags array to variable local to loop instance
            let inheritedTags = ancestorTags.slice();
            
            // If the node is just a break
            if ('tagName' in node && node.tagName.toLowerCase() == 'br') {
                // Add break element
                this.words.push({
                    str: '',
                    styles: ['br']
                })
            }
            
            // Found a text node!
            if (node.nodeType === 3) {

                // Split text inside child nodes
                let nodeWords = node.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el){ return el.replace(/([\n])/g, ''); } )
                // If empty element, push a spacer word to reflect that
                if (nodeWords.length < 1) {
                    this.words.push({
                        str: '',
                        styles: ['space', 'space-first', 'space-last'].concat(inheritedTags)
                    })
                }

                // Otherwise loop through words, and process into array
                for (let wIndex = 0; wIndex < nodeWords.length; wIndex++) {
                   let nodeWord = nodeWords[wIndex];
                    let word = {
                        str : nodeWord,
                        styles: [].concat(inheritedTags)
                    }
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
                            })
                        }
                    }
                    if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
                        word.styles.push(tagName + '-z')
                        if (tagName == 'p' || tagName == 'h1' || tagName == 'h2' || tagName == 'h3') {
                            addBr = true
                        }
                        if (lastInBlock === true) {
                            addBr = true
                        }
                    }
                    this.words.push(word);
                    if (addBr) {
                        // Add break element
                        this.words.push({
                            str: '',
                            styles: ['br']
                        })
                    }
                }
                if (lastInBlock === true) {
                    this.words.push({
                        str: '',
                        styles: ['br']
                    })
                }
            } else {
                if (lastInBlock === true ) {
                    this.words.push({
                        str: '',
                        styles: ['br']
                    })
                }
                // If not a text node, dig deeper for text nodes
                if ( index == nodes.length - 1 && (tagName == 'p' || tagName == 'h1' || tagName == 'h2' || tagName == 'h3')) {
                    this.extractTextNodes(node, inheritedTags, true)
                } else {
                    this.extractTextNodes(node, inheritedTags)
                }
            }
        }
    }

    private saveReading(event, form) {
        this.isDraft = true
        this.onSubmit(form)
    }

    private shareReading(shareObj: ReadingShareObject, form) {
        // Handle group options passed back from Nav
        form.label = shareObj.groupLabel
        form.customCode = shareObj.customCode
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
        this.submitted = true
        if (this.isDraft===false) {
            this.addLoadingP = true
        } else {
            this.addLoadingD = true
        }
        this.error = '';

        // Custom empty validation for reading content
        if (this.el.nativeElement.querySelector('medium-editor').innerText.trim().length > 0 || this.el.nativeElement.querySelectorAll('medium-editor img').length > 0) {
            this.readingIsBlank = false
        } else {
            this.readingIsBlank = true
        }

        // This would be better handled by formcontrols
        if (!form.title || form.title.length < 1 || this.readingIsBlank) {
            this.addLoadingD = false
            this.addLoadingP = false
            this.error = 'Not quite, please check all the fields!'
            return
        }

        // Clear parsed words array
        this.words = []

        // Process reading html into useful Words Array
        let editorHtml = this.el.nativeElement.querySelectorAll('#angularMediumEditor')

        for (let i=0; i<editorHtml.length; i++) {
            // Add question "word"
            if (this.readingHtml[i].question) {
                // Concatenate the 
                this.concatHtml += "<$question$>"
                this.words.push({
                    styles: ['question'],
                    index: i - 1
                })
            }

            // Add question to questions
            if (this.readingHtml[i].question) {
                this.questions.push(this.readingHtml[i].question)
            }

            // Concatenate the html to 1 string [not currently using with current config]
            // this.concatHtml += editorHtml[i]
            this.concatHtml += this.readingHtml[i].text

            let childEls = editorHtml[i].childNodes

            // Loop through all Reading html elements
            for (let childEl of childEls) {
                this.extractTextNodes(childEl)
            }
        }

        // Create reading object to submit based on form object parameter
        let reading: any = Object.assign({},form)
        delete reading.label
        // reading.html = this.readingHtml
        reading.html = this.concatHtml
        reading.words = this.words
        reading.questions = this.questions

        // If the reading is not being saved as a draft (A.K.A. it's a final version)
        if (this.isDraft === true) {
            reading.draft = true
        } else {
            reading.draft = false
        }
        if (this.readingId!=='') {
            reading._id = this.readingId
        }
        if (this.versionId) {
            reading.version_id = this.versionId
        }
        if (this.ownerId) {
            reading.owner_id = this.ownerId
        }
        // if (this.readingHtml[1]) {
        //     reading.questions = this.questions
        // }

        // having an _id controls whether it is a put or post call
        let submitAction: string
        if (reading['_id']) {
            submitAction = "updateReading"
        } else {
            submitAction = "createNewReading"
        }
        if (reading.questions && reading.questions.length > 0) {
            this.angulartics.eventTrack.next({ action: submitAction + 'WithQuestion', properties: { category: 'heroFeature', label: 'attempt' }})
        } else {
            this.angulartics.eventTrack.next({ action: submitAction, properties: { category: 'contentManagement', label: 'attempt' }})
        }
        console.log(reading)
        this._readings.save(reading)
            .subscribe(
                data => {
                    if (data._id) {
                        if (reading.questions.length > 0) {
                            this.angulartics.eventTrack.next({ action: submitAction + 'WithQuestion', properties: { category: 'heroFeature', label: 'success' }})
                        } else {
                            this.angulartics.eventTrack.next({ action: submitAction, properties: { category: 'contentManagement', label: 'success' }})
                        }
                        // Create default Project if it is in final version
                        if (reading.draft===false) {
                            // Get authorized comment types
                            let commentTypes = this._auth.getAllowedCommentTypes()

                            this._projects.create(data._id, { 'label' : form.label, 'types' : commentTypes, 'code': form.customCode })
                                .subscribe( (project) => {
                                    this.addLoadingD = false
                                    this.addLoadingP = false
                                    this.router.navigate(['project', project._id])
                                }, (error) => {
                                    console.error(error)
                                    this.addLoadingD = false
                                    this.addLoadingP = false
                                });
                        } else {
                            console.log(data)
                            this.addLoadingD = false
                            this.addLoadingP = false
                            this.router.navigate(['new-reading/' + data._id], { queryParams: { successAlert: this.successAlert } })
                            this.successObject.readingSuccess = this.successAlert
                            this.showAlert = true
                            this.reading.updatedAt = data.updatedAt
                        }
                    }
                },
                error => {
                    console.log(error)
                    this.addLoadingD = false
                    this.addLoadingP = false
                    if (reading.questions.length > 0) {
                        this.angulartics.eventTrack.next({ action: submitAction + 'WithQuestion', properties: { category: 'heroFeature', label: 'failure' }})
                    } else {
                        this.angulartics.eventTrack.next({ action: submitAction, properties: { category: 'contentManagement', label: 'failure' }})
                    }
                    this.errorObject.readingError = "There was an issue saving your reading. It may be our fault; please try again"
                }
            )
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
            let imgString = ''
            images.forEach(image => {
                imgString += '<img src="' + image.url + '" title="' + image.title + '" /><br/><p></p>'
            })
            this.readingHtml[this.readingHtml.length-1].text += imgString
        }
    }

    /**
     * Adds a question block to the new reading and then adds in a new medium editor
     */
    private addQuestion(insertHtml?: any, insertPos?: number) {
        var question = <EdjiQuestion>{
            prompt: '',
            answer_types: [],
            option_types: [],
            new: true,
            question_number: this.readingHtml.length
        }
        
        if (insertHtml) {
            question.question_number = insertPos
            if (this.readingHtml.length > insertPos) {
                this.readingHtml.splice(insertPos,0,{'text':insertHtml,'question':question})
            } else {
                this.readingHtml.push({'text':insertHtml,'question':question})
            }
            this.updateQuestionNumbers()
        } else {
            this.readingHtml.push({'text':this.newReadingInner,'question':question})
        }
    }

    /**
     * Add a question to the "middle" of existing text and split it up
     */
    private addQuestionInLine() {
        if (this.insertNode && this.insertNode.parentNode) {
            // If there is a reference node for cursor position, insert at cursor
            // Get and clear all elements in the medium editor block after the cursor position
            let tmpHtml = this.extractBlockContentsFromCaret()

            // Send the 'enter' key 
            const event = new KeyboardEvent("keypress",{
                "key": "Enter"
            });
            document.dispatchEvent(event)

            // Create a new block and slice it in.. then add the stored text to that block
            let insertPos = Number(this.insertNode.parentNode.parentNode.getAttribute('rIndex')) + 1

            // Make the html fragment a real piece of html!
            var div = document.createElement('div');
            div.appendChild( tmpHtml.cloneNode(true) );
            var html = div.innerHTML;

            this.addQuestion(html,insertPos)
        } else {
            // If no reference node (field has not been interacted with) insert question at end
            this.addQuestion()
        }
    }

    /**
     * Extracts all elements in the medium editor after the cursor
     */
    private extractBlockContentsFromCaret(): any {
        var sel = Rangy.getSelection()
        if (sel.rangeCount) {
            var selRange = sel.getRangeAt(0)
            var blockEl = this.getBlockContainer(selRange.endContainer)
            if (blockEl) {
                var range = selRange.cloneRange()
                range.selectNodeContents(sel.focusNode.parentNode.parentNode)
                range.setStart(selRange.endContainer, selRange.endOffset)
                return range.extractContents()
            }
        }
    }

    /**
     * Gets the block container for the element extractor
     */
    private getBlockContainer(node) {
        while (node) {
            // Example block elements below, you may want to add more
            //&& /^(P|H[1-6]|DIV)$/i.test(node.nodeName)
            if (node.nodeType == 1 ) {
                return node
            }
            node = node.parentNode
        }
    }

    /**
     * Removes a question block to the new reading and then adds in a new medium editor
     */
    private deleteQuestion(questionNum: number) {
        // Append the text after the question to be deleted to the one before it
        this.readingHtml[questionNum-1].text += this.readingHtml[questionNum].text

        // Remove the question
        this.readingHtml.splice(questionNum, 1)
    }

    /**
     * Sets up the reading draft if it contains questions
     */
    private populateDraftContent(html) {
        let tmpArray = html.split("<$question$>")
        this.readingHtml[0].text = tmpArray[0]
        for (let i=1;i<tmpArray.length;i++) {
            this.readingHtml.push({'text':tmpArray[i],'question':this.reading.questions[i-1]})
            this.readingHtml[i].question.new = true
            this.readingHtml[i].question.question_number = i
        }
    }

    /**
     * Sets up the reading draft if it contains questions
     */
    private updateQuestionNumbers() {
        for (let i=1;i<this.readingHtml.length;i++) {
            this.readingHtml[i].question.question_number = i
        }
    }
}