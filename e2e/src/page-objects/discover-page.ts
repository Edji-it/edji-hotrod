import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class Discover implements PageObjectInterface {
  private EC = protractor.ExpectedConditions
  // Public Instance Variables
  // public readingCards = element.all(by.css('.reading-card'));
  // // public firstReadingCard = this.readingCards.first();
  // public projectCards     = element.all(by.css('.project-card'));
  // public firstProject     = this.projectCards.first();
  public followEdjiMsg = element(by.id('notFollowingMessage'))
  public followEdjiTag = element(by.id('followEdjiTag'))
  public followTags = element.all(by.css('.badge-follow'))
  public unfollowTags = element.all(by.css('.badge-unfollow'))
  public feedReadings = element.all(by.css('.feed__reading'))
  public firstFeedReading = this.feedReadings.first()

  // Discover Filters
  public filterPublic = element(by.id('discoverFilterPublic'))
  public filterFollowing = element(by.id('discoverFilterFollowing'))

  // get the dashboard page
  getPage(): void {
    browser.get('/')
    browser.get('/#/discover')
  } //getPage(): void

  toggleFollowEdji(follow: boolean): void {
    if (follow) {
      this.followEdjiTag.isPresent().then(result => {
        if (result) {
          this.followEdjiTag.isDisplayed().then(result => {
            if (result) {
              this.followEdjiTag.click()
            }
          })
        } else {
          // we were expecting to click the follow Edji button, but we were not able to
          // switch to public
          this.filterPublic.click()
          browser.wait(this.hasClass(this.filterFollowing, 'active'), 5000, 'public filter never became active')
          // switch back to following
          this.filterFollowing.click()
          browser.wait(this.hasClass(this.filterFollowing, 'active'), 5000, 'following filter never became active')
          this.followEdjiTag.isPresent().then(result => {
            if (result) {
              this.followEdjiTag.isDisplayed().then(result => {
                if (result) {
                  this.followEdjiTag.click()
                }
              })
            }
          })
        }
      })
    } else {
      this.followEdjiTag.isPresent().then(result => {
        if (!result) {
          let unfollowEdjiTag = this.unfollowTags.first()
          unfollowEdjiTag.isPresent().then(result => {
            if (result) {
              unfollowEdjiTag.isDisplayed().then(result => {
                if (result) {
                  unfollowEdjiTag.click()
                }
              })
            }
          })
        }
      })
    }
  }

  hasClass(el: any, cls: string) {
    return el.getAttribute('class').then(classes => {
      return classes.split(' ').indexOf(cls) !== -1
    })
  }
}
