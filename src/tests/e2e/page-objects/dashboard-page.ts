import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Dashboard implements PageObjectInterface
{

    private EC = protractor.ExpectedConditions; // vital
    /*
    28 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    Page Object for the Dashboard page.
    */

    // Public Instance Variables
    public readingCards = element.all(by.css('.reading-card'));
    public firstReadingCard = this.readingCards.first();
    public projectCards     = element.all(by.css('.project-card'));
    public firstProject     = this.projectCards.first();
    public projectCodeInput  = element(by.id("projectCodeInput"));
    public projectCodeInputNav  = element(by.id("projectCodeInputNav"));
    public projectJoinButton = element(by.css('#buttonJoinProject'));
    public newReadingButton = element(by.id('buttonNewReading'));
    public newReadingMobileButton = element(by.id('buttonNewReadingMobile'));
    // public optionsButton = element.all(by.css('.btn-icon--plain')).first();
    public optionsButton    = element(by.css('.btn-icon--plain'));
     //public optionsList = element.all(by.css('.reading-card-menu'))
    public createdTab    = element(by.id('createdTab'));

    // Dropdown buttons
    public dropDownMenu     = element(by.css('.btn-icon--plain'));
    public firstDropdownMenu = element.all(by.css('.btn-icon--plain')).first();
    public copyAndEditButton = element(by.cssContainingText('.dropdown-item', 'Copy and Edit'));
    public createNewGroupButton = element(by.cssContainingText('.dropdown-item', 'Create New Group'));
    public deleteButton     = element(by.cssContainingText('.dropdown-item', 'Delete'));
    public deleteConfirm = element(by.id('delBtnModal'));

    public deleteProjectButton = element(by.css(".btn--delete-project"));
    // public firstDeleteProjectButton = element(by.css("btn--delete-project")).first();
    public projectLabel     = element(by.css('#newProjectLabel'));
    public groupCreate      = element(by.css('#buttonCreateGroup'));
    public titleInput = element(by.id('readingTitle'));

    // get the dashboard page
    getPage() : void {
        browser.get('/#/dashboard');
    } //getPage(): void

    // get the new reading page
    openNewReading() : void {
        browser.wait(this.EC.urlContains("dashboard"), 5000, "never reached the dashboard before clicking new reading button");
        // Click the new reading button on the dashboard for mobile
        this.createdTab.isPresent().then((result) => {
            if (result) {
                this.createdTab.isDisplayed().then((result) => {
                    if (result) {
                        // Click the created tab first
                        this.createdTab.click();
                        browser.wait(this.EC.elementToBeClickable(this.firstReadingCard), 5000, "never found the first created reading");
                        // Click the new reading button
                        browser.wait(this.EC.elementToBeClickable(this.newReadingMobileButton), 5000, "never found the new reading button");
                        this.newReadingMobileButton.click();
                    } 
                });
            }
        });

        // Click the new reading button on the dashboard for desktop
        this.newReadingButton.isPresent().then((result) => {
            if (result) {
                this.newReadingButton.isDisplayed().then((result) => {
                    if (result) {
                        // Click the new reading button
                        browser.wait(this.EC.elementToBeClickable(this.newReadingButton), 5000, "never found the new reading button");
                        this.newReadingButton.click();
                    } 
                });
            }
        });

        browser.wait(this.EC.elementToBeClickable(this.titleInput), 5000);
    } // getNewReadingPage() : void

    // 6.3.17
    createNewGroupModalInput (groupName : string) : void {
        // The modal needs to have already appeared before you use this.
        // This tak groupName and hits the Create Group button on the modal.

        let groupNameInput      = element(by.id('newProjectLabel'));
        let createGroupButton   = element(by.id("buttonCreateGroup")); 

        browser.wait(this.EC.presenceOf(groupNameInput), 5000, "never saw a groupNameInput");
        browser.wait(this.EC.elementToBeClickable(groupNameInput), 5000, "groupNameInput was never clickable");

        groupNameInput.sendKeys(groupName);
        
        browser.wait(this.EC.presenceOf(createGroupButton), 5000, "never saw a createGroupButton");
        browser.wait(this.EC.elementToBeClickable(createGroupButton), 5000, "createGroupButton was never clickable");

        createGroupButton.click();
    } // createNewGroupModalInput (groupName : string) : void

    // Switch to the created readings tab on mobile 
    goToCreatedTab(): void {
        browser.wait(this.EC.urlContains("dashboard"), 5000, "never reached the dashboard before clicking new reading button");
        this.createdTab.isPresent().then((result) => {
            if (result) {
                this.createdTab.isDisplayed().then((result) => {
                    if (result) {
                        // Click the created tab first
                        this.createdTab.click();
                        browser.wait(this.EC.elementToBeClickable(this.firstReadingCard), 5000, "never found the first created reading");
                    } 
                });
            }
        });
    }
} 