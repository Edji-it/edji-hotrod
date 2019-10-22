import { browser, by, element, protractor } from 'protractor'

import { Home, Login, Sidebar, Hero, Dashboard, NewReading, Discover, Register, Project } from './page-objects'
import { LoginForm, RegisterForm, UserDetailsModal } from './components'

describe('Teacher Onboarding', () => {
  let login = new Login()
  let loginForm = new LoginForm()
  let registerForm = new RegisterForm()
  let register = new Register()
  let sidebar = new Sidebar()
  let userDetails = new UserDetailsModal()
  let dashboard = new Dashboard()
  let newReading = new NewReading()
  let project = new Project()
  let discover = new Discover()
  let EC = protractor.ExpectedConditions


  let gradeLevelsElementary = element(by.css('[data-test="gradesOption0"]'))
  let templateChoiceSection = element(by.css('[data-test="templateChoices"]'))
  let templateChoices = element.all(by.css('[data-test="templateChoice"]'))
  let onboardingDriver = element(by.id('driver-popover-item'))
  let onboardingTooltipNext = element(by.css('button.driver-next-btn'))
  let onboardingTooltipPrev = element(by.css('button.driver-prev-btn'))
  let groupCreateMessage = element(by.css('[data-test="createGroupOnboarding"]'))
  let groupCodeMessage = element(by.css('[data-test="groupCodeOnboarding"]'))
  let commentHintMessage = element(by.css('[data-test="commentHintOnboarding"]'))
  let tutorialGifModal = element(by.css('[data-test="tutorialGifModal"]'))
  let tutorialGifModalClose = element(by.css('[data-test="tutorialGifModal"] .close'))

  // Toasts
  let firstReadingToast = element(by.css('#firstReading.toast'))
  let firstCommentToast = element(by.css('#firstComment.toast'))

  afterEach(() => {
    browser
      .manage()
      .logs()
      .get('browser')
      .then(browserLog => {
        if (browserLog.length > 0) {
          browserLog.forEach(log => {
            console.error(log.message)
          })
        }
      })
  })

  describe('Register and complete onboarding for New Reading', () => {

    it('should register a new teacher account', () => {
         // Open Register page
        register.getPage()
        // Verify user lands on Registration page
        browser.wait(EC.urlContains('register'), 5000, 'registration page did not open')
        // Attempt registration
        registerForm.submit('teacher')
        // Created user should land on Dashboard
        browser.wait(EC.urlContains('dashboard'), 5000, 'referred user failed to register')
        // Confirm account type
    })
   
    it('should complete dashboard teacher onboarding flow', () => {
        userDetails.addDetails()
        // Wait for onboarding to show
        browser.wait(EC.elementToBeClickable(gradeLevelsElementary), 3000, 'first onboarding options did not become clickable')
        // Select first grade levels option
        gradeLevelsElementary.click()
        // Template choices
        browser.wait(EC.visibilityOf(templateChoiceSection), 3000, 'onboarding template options did not appear')
        browser.wait(EC.elementToBeClickable(templateChoices.first()), 3000, 'first onboarding template option was not clickable')
        templateChoices.first().click()
        // Should land on New Reading page
        browser.wait(EC.urlContains('new-reading'), 5000, 'onboarding template did not open New Reading page')
    })
    
    it('should navigate New Reading onboarding tooltips', () => {
        browser.wait(EC.visibilityOf(onboardingDriver), 5000, 'onboarding (driver.js) tooltip did not show')
        browser.wait(EC.elementToBeClickable(onboardingTooltipNext), 3000, 'onboarding next tooltip button was not clickable')
        onboardingTooltipNext.click()
        // Should paginate to the next page
        browser.wait(EC.elementToBeClickable(onboardingTooltipPrev), 3000, 'onboarding previous tooltip button did not become clickable')
        // Go back to first tooltip
        onboardingTooltipPrev.click()
        // Proceed through remaining tooltips
        let proceedThroughTooltips = async () =>{
            // Wait for tooltip animation
            browser.sleep(600)
            let newTooltip = await onboardingTooltipNext.isDisplayed()
            if (newTooltip) {
                onboardingTooltipNext.click()
                proceedThroughTooltips()
            }
        }
        proceedThroughTooltips()
    })

    it('should create onboarding lesson without any changes', () => {
        // Create reading
        newReading.clickShareAndArchive()
        // Verify create group message
        browser.wait(EC.visibilityOf(groupCreateMessage), 3000, 'did not see create group modal onboarding message')
        newReading.createGroupButtonClick()
        // Verify lesson does have template instructions
        browser.wait(EC.visibilityOf(groupCodeMessage), 5000, 'did not see group code modal onboarding message')
        // Close group code modal
        newReading.shareCodeModalClose.click()
        // Verify toast appeared
        browser.wait(EC.visibilityOf(firstReadingToast), 3000, 'first reading success toast did not appear')
    })

    it('should see and open commenting onboarding guide', () => {
        // Is margin message present?
        browser.wait(EC.visibilityOf(commentHintMessage), 3000, 'onboarding commenting hint not visible')
        commentHintMessage.click()
        // Should open tutorial gif on commenting
        browser.wait(EC.visibilityOf(tutorialGifModal), 3000, 'tutorial gif modal did not open')
        // Wait for modal animation
        browser.sleep(400)
        tutorialGifModalClose.click()
        browser.sleep(400)
        // Make comment
        project.createEmojiComment()
        // Verify tutorial message hides
        browser.wait(EC.invisibilityOf(commentHintMessage), 3000, 'onboarding commenting hint did not hide when comment made')
        // Verify "first comment" toast appears
        browser.wait(EC.visibilityOf(firstCommentToast), 3000, 'first comment success toast did not appear')
    })

    // @todo Back to dashboard
    // @todo Verify template message no longer shows
  })
})
