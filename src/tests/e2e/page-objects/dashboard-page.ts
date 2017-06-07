import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Dashboard implements PageObjectInterface
{
    /*
    28 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    Page Object for the Dashboard page.
    */

    // Public Instance Variables
    public readingCards = element.all(by.css('.reading-card'));
    // public firstReadingCard = this.readingCards.first();
    public projectCards     = element.all(by.css('.project-card'));
    public firstProject     = this.projectCards.first();
    public projectCodeInput = element(by.css('#projectCodeInput'));
    public projectJoinButton = element(by.css('#buttonJoinProject'));
    // public optionsButton = element.all(by.css('.btn-icon--plain')).first();
    public optionsButton    = element(by.css('.btn-icon--plain'));
     //public optionsList = element.all(by.css('.reading-card-menu'))

    // Dropdown buttons
    public dropDownMenu     = element(by.id('optionsWrap'));
    public copyAndEditButton = element(by.cssContainingText('.dropdown-item', 'Copy and Edit'));
    public createNewGroupButton = element(by.cssContainingText('.dropdown-item', 'Create New Group'));
    public deleteButton     = element(by.cssContainingText('.dropdown-item', 'Delete'));

    public deleteProjectButton = element(by.css(".btn--delete-project"));
    // public firstDeleteProjectButton = element(by.css("btn--delete-project")).first();
    public projectLabel     = element(by.css('#newProjectLabel'));
    public groupCreate      = element(by.css('#buttonCreateGroup'));

    // get the dashboard page
    getPage() : void {
        browser.get('/#/dashboard');
    } //getPage(): void

    // get the new reading page
    getNewReadingPage() : void {
        browser.get('/#/new-reading');
    } // getNewReadingPage() : void

    // 6.3.17
    createNewGroupModalInput (groupName : string) : void {
        // The modal needs to have already appeared before you use this.
        // This tak groupName and hits the Create Group button on the modal.

        let EC = protractor.ExpectedConditions;
        let groupNameInput      = element(by.id('newProjectLabel'));
        let createGroupButton   = element(by.id("buttonCreateGroup")); 

        browser.wait(EC.presenceOf(groupNameInput), 5000, "never saw a groupNameInput");
        browser.wait(EC.elementToBeClickable(groupNameInput), 5000, "groupNameInput was never clickable");

        groupNameInput.sendKeys(groupName);
        
        browser.wait(EC.presenceOf(createGroupButton), 5000, "never saw a createGroupButton");
        browser.wait(EC.elementToBeClickable(createGroupButton), 5000, "createGroupButton was never clickable");

        createGroupButton.click();
    } // createNewGroupModalInput (groupName : string) : void
} 