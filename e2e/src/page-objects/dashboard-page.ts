import { browser, by, element, protractor, ElementFinder } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'
import { reset } from '../utils/browser-methods'

export class Dashboard implements PageObjectInterface {
  private EC = protractor.ExpectedConditions

  // Public Instance Variables
  public readingCards = element.all(by.css('.reading-card'))
  public firstReadingCard = this.readingCards.first()
  public firstDraftCard = element.all(by.css('.draft-card')).first()
  public archivedReadingCards = element.all(by.css('.reading-card.archived'))
  public readingTitles = element.all(by.css('.reading-title__text'))
  public firstReadingTitle = this.readingTitles.first()
  public readingTitleText = (title: string) => element(by.cssContainingText('.reading-title__text', title))
  public readingLoader = element(by.css('.e2e-reading-loader'))
  public secondPageFirstReadingTitle = element.all(by.css('.page-2 .reading-title__text')).first()
  public projectCards = element.all(by.css('.project-card'))
  public firstProject = this.projectCards.first()
  public projectCodeInput = element(by.id('projectCodeInputJoinDash'))
  public projectCodeInputNav = element(by.id('projectCodeInputNav'))
  public projectJoinButton = element(by.css('#buttonJoinProject'))
  public newReadingButton = element(by.id('buttonNewReading'))
  public newReadingMobileButton = element(by.id('buttonNewReadingMobile'))
  public optionsButton = element(by.css('.btn-icon--plain'))
  public createdTab = element(by.id('createdTab'))
  public createdListLoading = element(by.css('.created-list.loading'))
  public createdListNextPage = element(by.css('.created-list .ui-paginator-next'))
  public createdListPrevPage = element(by.css('.created-list .ui-paginator-prev'))
  public getReadingOptionsByTitle = (title: string) => element(by.css('button[data-test="options-' + title + '"]'))
  public getReadingDeleteByTitle = (title: string) => element(by.css('button[data-test="delete-' + title + '"]'))
  public searchCount = element(by.id('searchCount'))
  public searchInput = element(by.id('readingSearch'))
  public bookmarksBtn = element(by.id('bookmarksBtn'))
  public strategiesBtn = element(by.id('dashboardFilterStrategies'))

  // public toggle and status
  public publicStatusTitle = 'Public Status <Do Not Delete or Use>'
  public publicToggleBtnOld = element(by.id('togglePublic'))
  public publicToggleBtn = (title: string) => element(by.css('div[testFindTogglePublic="' + title + '"]'))
  public publicReadingStatus = element(by.id('readingPublic'))
  public privateReadingStatus = element(by.id('readingPrivate'))
  public readingMakePublic = element(by.id('readingMakePublic'))
  public readingMakePrivate = element(by.id('readingMakePrivate'))

  // Dropdown buttons
  public dropDownMenu = element(by.css('.btn-icon--plain'))
  public firstDropdownMenu = element.all(by.css('.btn-icon--plain')).first()
  public copyAndEditButton = element(by.cssContainingText('.dropdown-item', 'Copy and Edit'))
  public createNewGroupButton = element(by.cssContainingText('.dropdown-item', 'Create New Group'))
  public deleteButton = element(by.cssContainingText('.dropdown-item', 'Delete'))
  public deleteConfirm = element(by.id('delBtnModal'))
  public readingLinkButton = element.all(by.css('.e2e-reading-link')).first()

  // groups
  public deleteProjectButton = element(by.css('.btn--delete-project'))
  public projectLabel = element(by.id('newProjectLabel'))
  public groupCreate = element(by.id('buttonCreateGroup'))
  public titleInput = element(by.id('readingTitle'))
  public uniqueGroupTitle = 'Cynder is such a cool dog'
  public newGroupButton = element.all(by.css('.e2e-new-group')).first()
  public newProjectCard = element(by.css('.new-project'))
  public getGroupDeleteButton = (card: ElementFinder) => card.element(by.css('.btn--delete-project'))
  public groupDeleteModal = element(by.id('deleteProjectModal'))
  public groupDeleteModalConfirmButton = element(by.id('delProjectBtnModal'))

  // Toasts
  public toast = element(by.css('.toast'))
  public toastClose = element(by.css('.toast .close'))

  // get the dashboard page
  getPage(): void {
    browser.get('/#/dashboard')
    // Allow dashboard to display reading cards, and avoid interacting with previous data that may flash/render
    browser.sleep(1500)
  } //getPage(): void

  // get the dashboard page
  getLicenseManage(): void {
    browser.get('/#/academy/licenses')
  }

  // get the new reading page
  openNewReading(): void {
    browser.wait(
      this.EC.urlContains('dashboard'),
      10000,
      'never reached the dashboard before clicking new reading button',
    )
    // Close any potentially blocking toasts
    this.toast.isPresent().then(result => {
      if (result) {
        this.toast.isDisplayed().then(result => {
          if (result) {
            this.toastClose.click()
            browser.wait(
              this.EC.invisibilityOf(this.toast),
              3000,
              'toast was blocking New Reading button, and did not close',
            )
          }
        })
      }
    })
    // Click the new reading button on the dashboard for mobile
    this.createdTab.isPresent().then(result => {
      if (result) {
        this.createdTab.isDisplayed().then(result => {
          if (result) {
            // Click the created tab first
            this.createdTab.click()
            browser.wait(
              this.EC.elementToBeClickable(this.firstReadingCard),
              5000,
              'never found the first created reading',
            )
            // Click the new reading button
            browser.wait(
              this.EC.elementToBeClickable(this.newReadingMobileButton),
              5000,
              'never found the new reading button',
            )
            this.newReadingMobileButton.click()
          }
        })
      }
    })
    // Click the new reading button on the dashboard for desktop
    this.newReadingButton.isPresent().then(result => {
      if (result) {
        this.newReadingButton.isDisplayed().then(result => {
          if (result) {
            // Click the new reading button
            browser.wait(
              this.EC.elementToBeClickable(this.newReadingButton),
              5000,
              'never found the new reading button',
            )
            this.newReadingButton.click()
          }
        })
      }
    })

    browser.wait(this.EC.elementToBeClickable(this.titleInput), 5000)
  } // getNewReadingPage() : void

  // 6.3.17
  createNewGroupModalInput(groupName: string): void {
    // The modal needs to have already appeared before you use this.
    // This tak groupName and hits the Create Group button on the modal.
    let groupNameInput = this.projectLabel
    let createGroupButton = element(by.id('buttonCreateGroup'))

    browser.wait(this.EC.presenceOf(groupNameInput), 5000, 'never saw a groupNameInput')
    browser.wait(this.EC.elementToBeClickable(groupNameInput), 5000, 'groupNameInput was never clickable')

    groupNameInput.clear()
    groupNameInput.sendKeys(groupName)

    browser.wait(this.EC.presenceOf(createGroupButton), 5000, 'never saw a createGroupButton')
    browser.wait(this.EC.elementToBeClickable(createGroupButton), 5000, 'createGroupButton was never clickable')

    createGroupButton.click()
  }

  // Switch to the created readings tab on mobile
  goToCreatedTab(): void {
    browser.wait(
      this.EC.urlContains('dashboard'),
      5000,
      'never reached the dashboard before clicking first created reading',
    )
    this.createdTab.isPresent().then(result => {
      if (result) {
        this.createdTab.isDisplayed().then(result => {
          if (result) {
            // Click the created tab first
            this.createdTab.click()
            browser.wait(
              this.EC.elementToBeClickable(this.firstReadingCard),
              5000,
              'never found the first created reading',
            )
          }
        })
      }
    })
  }

  /**
   * Deletes a reading via options menu on dashboard
   * @param title Reading Title
   */
  deleteReadingByTitle(title: string): void {
    reset()
    this.getPage()
    browser.wait(
      this.EC.elementToBeClickable(this.getReadingOptionsByTitle(title)),
      8000,
      'reading card options button never became clickable after load',
    )
    // Open Reading options
    this.getReadingOptionsByTitle(title).click()
    // Select "Delete Reading"
    browser.wait(
      this.EC.elementToBeClickable(this.getReadingDeleteByTitle(title)),
      5000,
      'copy and edit button never became clicakble after options dropdown click',
    )
    this.getReadingDeleteByTitle(title).click()
    // Find delete Reading confirmation modal
    browser.wait(
      this.EC.elementToBeClickable(this.deleteConfirm),
      5000,
      'deleteConfirm on the deleteModal was never clickable',
    )
    // Delete modal confirm click has promise issues, so treat it a bit differently
    this.deleteConfirm.click()
    // Unable to confirm title
    browser.wait(
      this.EC.invisibilityOf(element(by.cssContainingText('.reading-title-text', title))),
      8000,
      'expected not to see the reading on the dashboard after deleting it',
    )
  }

  // Entering the project code from the home page
  enterProjectCodeFromNav(input: string): void {
    browser.wait(
      this.EC.urlContains('dashboard'),
      5000,
      'never reached the dashboard before putting in a reading code on nav',
    )
    // browser.wait(this.EC.elementToBeClickable(this.projectJoinButton), 5000, "never found the join project button");
    this.projectCodeInputNav.isPresent().then(result => {
      if (result) {
        this.projectCodeInputNav.isDisplayed().then(result => {
          if (result) {
            // Project code input within the nav was visible, usually for destkop
            browser.wait(this.projectCodeInputNav.isDisplayed, 5000, 'Never loaded Project Code input box')
            this.projectCodeInputNav.sendKeys(input)
            browser
              .actions()
              .sendKeys(protractor.Key.ENTER)
              .perform()
          } else {
            // Project code input just under the nav was visible, usually for mobile
            browser.wait(this.projectCodeInput.isDisplayed, 5000, 'Never loaded Project Code input box')
            this.projectCodeInput.sendKeys(input)
            browser
              .actions()
              .sendKeys(protractor.Key.ENTER)
              .perform()
          }
        })
      } else {
        this.projectCodeInputNav.isDisplayed().then(result => {
          if (result) {
            // Project code input within the nav was visible, usually for destkop
            browser.wait(this.projectCodeInputNav.isDisplayed, 5000, 'Never loaded Project Code input box')
            this.projectCodeInputNav.sendKeys(input)
            browser
              .actions()
              .sendKeys(protractor.Key.ENTER)
              .perform()
          } else {
            // Project code input just under the nav was visible, usually for mobile
            browser.wait(this.projectCodeInput.isDisplayed, 5000, 'Never loaded Project Code input box')
            this.projectCodeInput.sendKeys(input)
            browser
              .actions()
              .sendKeys(protractor.Key.ENTER)
              .perform()
          }
        })
      }
    })
  }
}
