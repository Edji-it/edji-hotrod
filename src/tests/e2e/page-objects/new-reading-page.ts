import * as path from 'path';
import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class NewReading implements PageObjectInterface
{
    /*
        Page Object for the New Reading page.
    */

    // Public Instance Variables
    public titleInput = element(by.id('readingTitle'));
    public contentInput = element(by.id('angularMediumEditor'));
    public sourceInput = element(by.id('readingSource'));
    public groupInput = element(by.id('firstProjectLabel'));
    public addButton = element(by.id('addReadingButton'));
    public finalizeButton = element(by.id('addReadingFinalizeButton'));
    public draftButton = element(by.id('saveDraftButton'));
    
    public uploadModalButton = element(by.css('#buttonUploadImage'));
    public imageUploadTrigger = element(by.id('buttonBeginImageUpload'));
    public imageFileInput = element(by.css('#imageFileInput'));
    public uploadedImage = element(by.css(".upload-list-item.new"));

    public uploadPDfModalButton = element(by.css('#buttonUploadPdf'));
    public pdfUploadTrigger = element(by.id('buttonBeginPdfUpload'));
    public pdfFileInput = element(by.css('#pdfFileInput'));
    public insertUploadedPdf = element(by.css(".upload-list-item.new .e2e-insert-doc"));
    
    public imageInReading = element(by.css(".content .img img"));
    // public imageUploadList = element.all(by.css('.upload-list-item'));
    
    public titleError = element(by.id('errorTitle'));
    public contentError = element(by.id('errorContent'));
    public groupError = element(by.id('errorGroupLabel'));
    public successAlert = element(by.css('.alert-success'));

    public titleString = 'Test: Early Beginnings of Robots';
    public titleImageString = 'Test: Image';
    public contentString = 'Many ancient mythologies, and most modern religions include artificial people, such as the mechanical servants built by the Greek god Hephaestus[16] (Vulcan to the Romans), the clay golems of Jewish legend and clay giants of Norse legend, and Galatea, the mythical statue of Pygmalion that came to life. Since circa 400 BC, myths of Crete include Talos, a man of bronze who guarded the Cretan island of Europa from pirates.\nWashstand automaton reconstruction, as described by Philo of Byzantium (Greece, 3rd century BC).';
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

} // class Login