import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Discover implements PageObjectInterface
{

    // Public Instance Variables
    // public readingCards = element.all(by.css('.reading-card'));
    // // public firstReadingCard = this.readingCards.first();
    // public projectCards     = element.all(by.css('.project-card'));
    // public firstProject     = this.projectCards.first();
    public followEdjiMsg = element(by.id("notFollowingMessage"))
    public followEdjiTag = element(by.id("followEdjiTag"))
    public followTags = element.all(by.css(".badge-follow"))
    public unfollowTags = element.all(by.css(".badge-unfollow"))
    public feedReadings = element.all(by.css(".feed__reading"))
    public firstFeedReading = this.feedReadings.first()

    // Discover Filters
    public filterPublic = element(by.id("discoverFilterPublic"))
    public filterFollowing = element(by.id("discoverFilterFollowing"))
    
    // get the dashboard page
    getPage() : void {
        browser.get('/')
        browser.get('/#/discover')
    } //getPage(): void
}  