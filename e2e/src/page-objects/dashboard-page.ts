import { browser, by, element, protractor, ElementFinder } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'
import { reset } from '../utils/browser-methods'
import { Sidebar } from './sidebar-page'
import { NewReading } from './new-reading-page'

export class Dashboard implements PageObjectInterface {
  private EC = protractor.ExpectedConditions
  private sidebar = new Sidebar()
  private newReading = new NewReading()

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
  public readingAddDetailsSubmit = element(by.id('readingAddDetails'))

  // public toggle and status
  public publicStatusTitle = 'Public Status <Do Not Delete or Use>'
  public publicToggleBtnOld = element(by.id('toggleType'))
  public publicToggleBtn = (title: string) => element(by.css('div[testFindToggleType="' + title + '"]'))
  public publicReadingStatus = element(by.id('readingPublic'))
  public privateReadingStatus = element(by.id('readingPrivate'))
  public academyReadingStatus = element(by.id('readingAcademy'))
  public readingMakePublic = element(by.css('.tooltip.show #readingMakePublic'))
  public readingMakePrivate = element(by.css('.tooltip.show #readingMakePrivate'))
  public readingMakeAcademy = element(by.css('.tooltip.show #readingMakeAcademy'))

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
  public labelInput = (index: number) => {
    return element(by.css('#labelInput' + index + ' input'))
  }
  public labelAddBtn = element(by.css('[data-test="addQuickLabelBtn"]'))

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
  createNewGroupModalInput(
    groupName: string,
    options?: {
      labels?: string[]
    },
  ): void {
    // The modal needs to have already appeared before you use this.
    // This tak groupName and hits the Create Group button on the modal.
    let groupNameInput = this.projectLabel
    let createGroupButton = element(by.id('buttonCreateGroup'))

    // Wait for new group modal animation
    browser.sleep(500)

    browser.wait(this.EC.presenceOf(groupNameInput), 5000, 'never saw a groupNameInput')
    browser.wait(this.EC.elementToBeClickable(groupNameInput), 5000, 'groupNameInput was never clickable')

    groupNameInput.clear()
    groupNameInput.sendKeys(groupName)

    // If options passed, use advanced settings
    if (options) {
      let advancedHeader = element(by.css('.ui-fieldset-toggleable.modal-fieldset'))
      advancedHeader.click()

      // Add Quick Labels if provided
      if (options.labels) {
        options.labels.forEach((label, i) => {
          if (i !== 0) {
            // click to add field
            this.labelAddBtn.click()
          }
          let labelInput = this.labelInput(i)
          browser.wait(
            this.EC.elementToBeClickable(labelInput),
            3000,
            `did not find Quick Label input field index ${i}`,
          )
          labelInput.click()
          labelInput.sendKeys(label)
        })
      }
    }

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

  // Switch to the joined groups tab
  goToJoinedTab(): void {
    // Wait for clickable
    browser.wait(this.EC.elementToBeClickable(this.sidebar.navRead), 3000, 'joined readings tab not found')
    this.sidebar.navRead.click()
    browser.wait(this.EC.urlContains('dashboard/read'), 3000, 'did not browse to joined readings dashboard')
    // sleep() excuse - Let readings update and render
    browser.sleep(500)
  }

  /**
   * Deletes a reading via options menu on dashboard
   * @param title Reading Title
   */
  deleteReadingByTitle(title: string): void {
    reset()
    this.getPage()
    // Wait for page to load
    browser.wait(
      this.EC.elementToBeClickable(this.firstReadingCard),
      5000,
      'reading cards did not appear on dashboard while trying to delete',
    )
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

  public readingTypeAddDetails(): void {
    // Wait for a modal to appear (either archive or create group)
    let modal = element(by.css('.modal.show'))
    browser.wait(this.EC.visibilityOf(modal), 5000, 'add more reading details modal never showed')
    // sleep() reason - Allow for modal fade-in
    browser.sleep(400)
    // Click the confirm archive reading button for new reading
    this.newReading.gradeTileK.isPresent().then(result => {
      if (result) {
        this.newReading.selectGradeSubject()
        browser.wait(
          this.EC.visibilityOf(this.readingAddDetailsSubmit),
          2000,
          'add more details submit button was not clickable',
        )
        this.readingAddDetailsSubmit.click()
      }
    })
  }
}
