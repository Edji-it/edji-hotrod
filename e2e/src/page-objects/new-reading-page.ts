import * as path from 'path';
import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class NewReading implements PageObjectInterface
{
    /*
        Page Object for the New Reading page.
    */
    private EC = protractor.ExpectedConditions;

    // Public Instance Variables
    public titleInput = element(by.id('readingTitle'));
    public contentInput = element.all(by.css('.medium-editor-element')).first();
    public contentInput1 = element.all(by.css('.medium-editor-element')).first();
    public contentInput2 = element.all(by.css('.medium-editor-element')).last();
    public sourceInput = element(by.id('readingSource'));
    public publicButton = element(by.id('readingMakePublic'));
    public privateButton = element(by.id('readingMakePrivate'));
    public groupInput = element(by.id('newProjectLabel'));
    public gradeTileK = element(by.id('gradeTile0'));
    public gradeTileU = element(by.id('gradeTile13'));
    public subjectDropdown = element(by.id('subjectDropdown'));
    public subjectFirstOption = element.all(by.css('#subjectDropdown .dropdown-item')).first();
    public addButton = element(by.id('addReadingButton'));
    public addButtonMobile = element(by.id('addReadingButtonMobile'));
    public finalizeButton = element(by.id('buttonCreateGroup'));
    public goToReadingButton = element(by.id('shareModalReadingButton'));
    public shareCodeModalClose = element(by.id('shareCodeModalClose'));
    public draftButton = element(by.id('saveDraftButton'));
    public draftButtonMobile = element(by.id('saveDraftButtonMobile'));
    public questionDelete = element.all(by.css('button.inline-delete.question-delete')).last();
    
    public uploadImageModalButton = element(by.css('#buttonUploadImage'));
    public uploadImageModalButtonMobile = element(by.css('#buttonUploadImageMobile'));
    public imageUploadTrigger = element(by.id('buttonBeginImageUpload'));
    public imageFileInput = element(by.css('#imageFileInput'));
    public uploadedImage = element(by.css(".upload-list-item.new"));
    public emojiAnswerButton = element(by.className('icon-emoji-comment'));
    public textAnswerButton = element(by.className('icon-text-comment'));

    public uploadPDfModalButton = element(by.css('#buttonUploadPdf'));
    public pdfUploadTrigger = element(by.id('buttonBeginPdfUpload'));
    public pdfFileInput = element(by.css('#pdfFileInput'));
    public insertUploadedPdf = element(by.css(".upload-list-item.new .e2e-insert-doc"));
    public insertToolToggleButton = element(by.id('buttonInsertToolToggle'));

    // Creating questions
    public insertQuestionButton = element(by.id('buttonInsertQuestion'));
    public insertQuestionButtonMobile =  element(by.id('buttonInsertQuestionMobile'));
    public insertQuestionPrompt = element.all(by.css('textarea.text-comment-input')).last();

    public imageInReading = element(by.css(".content .img img"));
    // public imageUploadList = element.all(by.css('.upload-list-item'));
    
    public titleError = element(by.id('errorTitle'));
    public contentError = element(by.id('errorContent'));
    public groupError = element(by.id('errorGroupLabel'));
    public successAlert = element(by.css('.alert-success'));

    public titleString = 'Test: Early Beginnings of Robots';
    public qTitleString = 'When and how, in early human development, did the capacity to ask questions develop?';
    public qPrompt1 = 'Do you really think this timeline is accurate?';
    public qPrompt2 = 'Are you willing to give up the information?';
    public titleImageString = 'Test: Image';
    public contentString = 'Many ancient mythologies, and most modern religions include artificial people, such as the mechanical servants built by the Greek god Hephaestus[16] (Vulcan to the Romans), the clay golems of Jewish legend and clay giants of Norse legend, and Galatea, the mythical statue of Pygmalion that came to life. Since circa 400 BC, myths of Crete include Talos, a man of bronze who guarded the Cretan island of Europa from pirates.\nWashstand automaton reconstruction, as described by Philo of Byzantium (Greece, 3rd century BC).';
    public qContentString1 = "Text before first question."
    public qContentString2 = "Text. AFTER Q"
    public qSourceString = "https://www.quora.com/When-and-how-in-early-human-development-did-the-capacity-to-ask-questions-develop"
    public contentShortString = 'Three Laws of Robotics\nA robot may not injure a human being or, through inaction, allow a human being to come to harm.';
    public contentShortStringB = '\nA robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\nA robot must protect its own existence as long as such protection does not conflict with the First or Second Laws.\n';
    public sourceString = 'https://en.wikipedia.org/wiki/Robot';
    public groupString = 'Test Group 001';

    public findIdExp = new RegExp(/([A-Za-z0-9]){24}/);

    // get the login page
    getPage() : void 
    {
        browser.get('/#/new-reading');
    } // getPage() : void

    public addNewReading(): void {
        // Click the share button for new reading no matter if it is on desktop or mobile
        this.addButton.isPresent().then((result) => {
            if (result) {
                this.addButton.isDisplayed().then((result) => {
                    if (result) {
                        browser.wait(this.EC.elementToBeClickable(this.addButton), 5000, "never found the share reading button");
                        this.addButton.click()
                    } else {
                        browser.wait(this.EC.elementToBeClickable(this.addButtonMobile), 5000, "never found the share reading button");
                        this.addButtonMobile.click()
                    }
                });
            }
        });
    }

    public saveDraftNewReading(): void {
        // Click the share button for new reading no matter if it is on desktop or mobile
        this.draftButton.isPresent().then((result) => {
            if (result) {
                this.draftButton.isDisplayed().then((result) => {
                    if (result) {
                        browser.wait(this.EC.elementToBeClickable(this.draftButton), 5000, "add draft button never became clickable after form entry");
                        this.draftButton.click()
                    } else {
                        browser.wait(this.EC.elementToBeClickable(this.draftButtonMobile), 5000, "add draft button never became clickable after form entry");
                        this.draftButtonMobile.click()
                    }
                });
            }
        });
    }

    // Click the insert image button if we're on a mobile view
    public insertImageButtonTap(): void {
        // Toggle the owner tools on mobile if the Owner Tools button is present
        this.insertToolToggleButton.isPresent().then((result) => {
            if (result) {
                this.insertToolToggleButton.isDisplayed().then((result) => {
                    if (result) {
                        // Click the Tools button to expand the insert tools options for mobile before proceeding
                        browser.wait(this.EC.elementToBeClickable(this.insertToolToggleButton), 5000, "never found the insert tool button");
                        this.insertToolToggleButton.click()

                        // Click the image upload button for mobile
                        browser.wait(this.EC.elementToBeClickable(this.uploadImageModalButtonMobile), 5000, "image upload modal button never became clickable");
                        this.uploadImageModalButtonMobile.click();
                    } else {
                        // Click the image upload button for desktop
                        browser.wait(this.EC.elementToBeClickable(this.uploadImageModalButton), 5000, "image upload modal button never became clickable");
                        this.uploadImageModalButton.click();
                    }
                });
            }
        });
    }

    // Click the insert question button if we're on a mobile view
    public insertQuestionButtonTap(): void {
        // Toggle the owner tools on mobile if the Owner Tools button is present
        this.insertToolToggleButton.isPresent().then((result) => {
            if (result) {
                this.insertToolToggleButton.isDisplayed().then((result) => {
                    if (result) {
                        // Click the Tools button to expand the insert tools options for mobile before proceeding
                        browser.wait(this.EC.elementToBeClickable(this.insertToolToggleButton), 5000, "never found the insert tool button");
                        this.insertToolToggleButton.click()

                        // Click the question add button for mobile
                        browser.wait(this.EC.elementToBeClickable(this.insertQuestionButtonMobile), 5000, "insert question button never became clickable");
                        this.insertQuestionButtonMobile.click();
                    } else {
                        // Click the question add button for desktop
                        browser.wait(this.EC.elementToBeClickable(this.insertQuestionButton), 5000, "insert question button never became clickable");
                        this.insertQuestionButton.click();
                    }
                });
            }
        });
    }

} // class Login