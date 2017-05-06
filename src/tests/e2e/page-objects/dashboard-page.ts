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
    public projectCards = element.all(by.css('.project-card'));
    public firstProject = this.projectCards.first();
    public projectCodeInput = element(by.css('#projectCodeInput'));
    public projectJoinButton = element(by.css('#buttonJoinProject'));
    // public optionsButton = element.all(by.css('.btn-icon--plain')).first();
    public optionsButton = element(by.css('.btn-icon--plain'));
    //public optionsList = element.all(by.css('.reading-card-menu'))
    public copyAndEditButton = element(by.cssContainingText('.dropdown-item', 'Copy and Edit'));
    public createNewGroupButton = element(by.cssContainingText('.dropdown-item', 'Create New Group'));
    public projectLabel = element(by.css('#newProjectLabel'));
    public groupCreate = element(by.css('#buttonCreateGroup'));

    // get the dashboard page
    getPage() : void {
        browser.get('/#/dashboard');
    }

    // get the new reading page
    getNewReadingPage() : void {
        browser.get('/#/new-reading');
    }
} 