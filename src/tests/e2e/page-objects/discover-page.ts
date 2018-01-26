import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Discover implements PageObjectInterface
{

    // Public Instance Variables
    // public readingCards = element.all(by.css('.reading-card'));
    // // public firstReadingCard = this.readingCards.first();
    // public projectCards     = element.all(by.css('.project-card'));
    // public firstProject     = this.projectCards.first();
    
    // get the dashboard page
    getPage() : void {
        browser.get('/#/discover');
    } //getPage(): void
} 