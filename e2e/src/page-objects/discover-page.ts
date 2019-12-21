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
  // "followStatus" are any follow or unfollow tags
  public followStatusTags = element.all(by.css('[data-test="followStatusTag"]'))
  public feedReadings = element.all(by.css('.feed__reading'))
  public firstFeedReading = this.feedReadings.first()
  public feedTitles = element.all(by.css('.feed__reading .reading-title__text'))
  public firstFeedTitle = this.feedTitles.first()
  public readingPreview = element(by.id('readingPreviewModal'))
  public shareReadingBtn = element(by.id('shareReadingButton'))
  public sendReadingLink = element(by.id('sendReadingLink'))
  public editReadingBtn = element(by.id('editReadingButton'))
  public loginFromPreviewBtn = element(by.id('loginFromPreview'))
  public closeReadingPreviewBtn = element(by.id('readingPreviewClose'))
  public loginModalEl = element(by.id('loginModal'))
  public outsideLoginModal = element(by.id('loginModalOutsideContent'))
  public previewTitle = element(by.id('previewTitle'))
  public strategiesBanner = element(by.id('discoverStrategies'))
  public discoverMyDistrict = element(by.id('discoverMyDistrict'))
  public discoverAcademy = element(by.id('discoverAcademy'))

  // Discover Filters
  public filterPublic = element(by.id('discoverFilterPublic'))
  public filterDistrict = element(by.id('discoverFilterDistrict'))
  public filterAcademy = element(by.id('discoverAcademyLibrary'))
  public filterFollowing = element(by.id('discoverFilterFollowing'))
  public filterStrategies = element(by.id('discoverFilterStrategies'))
  public searchCount = element(by.css('[data-test="searchCount"]'))
  public searchInput = element(by.id('readingSearch'))
  public clearSearchBtn = element(by.css('.form-control-clear.icon.icon-close'))

  // Share link modal
  public copyShareLink = element(by.id('copyShareLink'))
  public shareLinkClose = element(by.css('#readingLinkModal .close'))

  // get the dashboard page
  getPage(): void {
    browser.get('/')
    browser.get('/#/discover')
    // We expect a reading card to always show on initial load, so its a good indicator of the page being loaded
    browser.wait(
      this.EC.elementToBeClickable(this.firstFeedReading),
      5000,
      'getting Discover feed page, did not fully loaded because no reading cards loaded',
    )
  } //getPage(): void

  toggleFollowEdji(follow: boolean): void {
    // Verify the page has loaded with some sort of follow tags
    let firstFollowTag = this.followStatusTags.first()
    browser.wait(
      this.EC.elementToBeClickable(firstFollowTag),
      3000,
      'follow tags were not found when trying to follow/unfollow Edji',
    )
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

  validateReadingTitle(title: string) {
    return element.all(by.css('.reading-title__text')).reduce((acc, el) => {
      return el.getText().then(text => {
        return acc || text.includes(title)
      })
    }, false)
  }

  validatePreviewTitle(firstTitle: string, secondTitle: string): boolean {
    return firstTitle === secondTitle
  }

  getReadingTitle(el: any) {
    return el.getText().then(function(text: string) {
      return text
    })
  }

  getInputFieldText(el: any) {
    return el.getAttribute('value').then(function(value: string) {
      return value
    })
  }

  public closeReadingPreview(): void {
    // Click the share button for new reading no matter if it is on desktop or mobile
    this.closeReadingPreviewBtn.isPresent().then(result => {
      if (result) {
        this.closeReadingPreviewBtn.isDisplayed().then(result => {
          if (result) {
            this.closeReadingPreviewBtn.click()
            browser.wait(this.EC.invisibilityOf(this.readingPreview), 5000, 'failed to close the reading preview')
          }
        })
      }
    })
  }
}
