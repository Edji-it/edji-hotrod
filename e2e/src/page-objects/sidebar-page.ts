import { browser, by, element, protractor } from 'protractor'

export class Sidebar {
  private EC = protractor.ExpectedConditions // vital

  // Public Instance Variables
  public logOutButton = element(by.css('#logOutButton'))
  public logInButton = element(by.css('a#loginLink'))
  public avatarActionIcon = element(by.css('#avatarActionIcon'))
  public accountButton = element(by.id('accountButton'))
  public referralButton = element(by.id('navReferralButton'))
  public navCreate = element(by.id('navCreate'))
  public navRead = element(by.id('navRead'))
  public navDiscover = element(by.id('navDiscover'))
  public navDiscoverPublic = element(by.id('navDiscoverPublic'))
  public accountButtonSpan = this.accountButton.element(by.css('span'))
  public logo = element(by.id('logo'))
  public heroLink = element(by.id('heroLink'))
  public closeModal = element(by.css('.show .modal button.close'))
  public navAcademyBtn = element(by.id('navAcademy'))

  // Owner Tools
  public ownerTools = element(by.id('ownerToolsBar'))
  public leaderboardButton = element(by.id('toggleLeaderboard'))
  public firstCommenterComments = element.all(by.css('.e2e-comment--First-Commenter .user-icon')) // User icon is a more reliable indicator of visibility
  public firstCommenterFirstComment = this.firstCommenterComments.first()
  public prevStudentButton = element(by.id('studentFilterPrev'))
  public nextStudentButton = element(by.id('studentFilterNext'))
  public studentFilterClose = element(by.css('.filter-bubble .close'))
  public leaderboardClose = element(by.id('leaderboard--close'))
  public leaderboard = element(by.id('leaderboard'))
  public leaderLiveStatus = element.all(by.css('.live-status')).first()
  public heatButton = element(by.id('toggleHeatVision'))
  public heatButtonMobile = element(by.id('toggleHeatVisionMobile'))
  public ownerToolToggleButton = element(by.id('buttonOwnerToolToggle'))
  public readingReportButton = element(by.id('toggleReadingRecap'))
  public addCoTeacherButton = element(by.id('addCoTeacherBtn'))
  public ownerName = element.all(by.css('[data-test="owner-tag"]')).first()

  public backToDash(): void {
    this.closeModal.isPresent().then(result => {
      if (result) {
        this.closeModal.isDisplayed().then(result => {
          if (result) {
            //Whatever if it is true (displayed)
            browser.wait(
              this.EC.elementToBeClickable(this.closeModal),
              5000,
              'modal close button never became clickable',
            )
            this.closeModal.click()
          }
        })
      }
    })
    browser.wait(this.EC.elementToBeClickable(this.logo), 5000, 'logo never became clickable')
    this.logo.click()
    browser.wait(this.EC.urlContains('dashboard'), 5000, 'never arrived at dashboard after clicking logo')
  }

  public ownerToolToggle(): void {
    browser.wait(
      this.EC.elementToBeClickable(this.avatarActionIcon),
      5000,
      'avatar dropdown button never became clickable',
    )
    // Toggle the owner tools on mobile if the Owner Tools button is present
    this.ownerToolToggleButton.isPresent().then(result => {
      if (result) {
        this.ownerToolToggleButton.isDisplayed().then(result => {
          if (result) {
            // Click the Tools button to expand the owner tools options for mobile before proceeding
            browser.wait(
              this.EC.elementToBeClickable(this.ownerToolToggleButton),
              5000,
              'never found the owner tool toggle',
            )
            this.ownerToolToggleButton.click()
          }
        })
      }
    })
  }

  // Click the log out button.
  public clickLogOutButton(): void {
    // If modals left open, close them
    this.closeModals()
    // Wait for avatar icon to be clickable
    browser.wait(
      this.EC.elementToBeClickable(this.avatarActionIcon),
      5000,
      'nav avatar menu was not clickable prior to log out',
    )
    // Click to open menu
    this.avatarActionIcon.click()
    // Wait for log out option to be available
    browser.wait(
      this.EC.elementToBeClickable(this.logOutButton),
      5000,
      'nav avatar menu log out option did not become clickable',
    )
    // Click to log out
    this.logOutButton.click()
  } // clickLogOutButton () : void

  // Click the log out button.
  public clickAccountButton(): void {
    // Ensure nav menu icon is clickable
    browser.wait(this.EC.elementToBeClickable(this.avatarActionIcon), 3000, 'nav/avatar menu icon was not clickable while going to access account menu option')
    this.avatarActionIcon.click()
    this.accountButton.isPresent().then(result => {
      if (result) {
        this.accountButton.isDisplayed().then(result => {
          if (result) {
            this.accountButton.click()
          }
        })
      }
    })
  } // clickAccountButton () : void

  // Click nav refferal button
  public clickReferralButton(): void {
    // Ensure nav menu icon is clickable
    browser.wait(this.EC.elementToBeClickable(this.avatarActionIcon), 3000, 'nav/avatar menu icon was not clickable while going to access referral menu option')
    this.avatarActionIcon.click()
    this.referralButton.isPresent().then(result => {
      if (result) {
        this.referralButton.isDisplayed().then(result => {
          if (result) {
            this.referralButton.click()
          }
        })
      }
    })
  } // clickAccountButton () : void

  public closeModals(): void {
    // Toggle the owner tools on mobile if the Owner Tools button is present
    this.closeModal.isPresent().then(result => {
      if (result) {
        this.closeModal.isDisplayed().then(result => {
          if (result) {
            // Click the Tools button to expand the owner tools options for mobile before proceeding
            browser.wait(
              this.EC.elementToBeClickable(this.closeModal),
              5000,
              'modal close button never became clickable',
            )
            this.closeModal.click()
          }
        })
      }
    })
  }

  public closeLeaderboard(): void {
    this.leaderboard.isPresent().then(result => {
      if (result) {
        this.leaderboard.isDisplayed().then(result => {
          if (result) {
            this.leaderboardClose.click()
            browser.wait(this.EC.invisibilityOf(this.leaderboard), 5000, 'leaderboard never closed')
          }
        })
      }
    })
  }

  public logout(): void {
    this.closeModals()
    this.clickLogOutButton()
    // Verify page returns to home page
    browser.wait(this.EC.urlContains('home'), 5000, 'never arrived home after logging out')
  }

  public clickHeroLink(): void {
    // this.logo.click();
    // browser.wait(this.EC.elementToBeClickable(this.heroLink), 5000, "hero link never became clickable");
    this.heroLink.click()
  }

  public academyButtonClick(): void {
    browser.wait(this.EC.elementToBeClickable(this.navAcademyBtn), 5000, 'never saw Academy option in nav bar')
    this.navAcademyBtn.click()
  }
} // class Sidebar
