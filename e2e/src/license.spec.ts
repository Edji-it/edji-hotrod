import { browser, by, element, protractor } from 'protractor'
import { Sidebar, Login, Dashboard } from './page-objects'
import { AcademyMgmt } from './page-objects/academy-mgmt-page';

describe('Academy user that has ability to manage licenses for their academy: ', () => {
  let dashboard = new Dashboard()
  let login = new Login()
  let sidebar = new Sidebar()
  let mgmt = new AcademyMgmt()
  let EC = protractor.ExpectedConditions

  let licenseLoader = element(by.id('licenseMgmtLoader'))

  describe('Non-Admin users should not be able to access the license mgmt page', () => {
    beforeEach(() => {
      login.getPage()
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    })

    afterEach(() => {
      sidebar.logout()

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

    it('should log in as a student and not be able to access the academy license manage page', () => {
      login.loginAndVerify(login.studentUser, login.studentPassword)
      dashboard.getLicenseManage()
      browser.wait(EC.urlContains('dashboard'), 5000, 'should not have hit the licenses page')
    })

    it('should log in as a teacher (non-hero) and not be able to access the academy license manage page', () => {
      // log-in as the teacher (non-hero) and make sure we hit the dashboard
      login.loginAndVerify(login.teacherUser, login.teacherPassword)
      // go to the academy license manage page
      dashboard.getLicenseManage()
      // should not go to the licenses page
      browser.wait(EC.urlContains('dashboard'), 5000, 'should not have hit the licenses page')
    })
  })

  describe('Academy admin should be able to log in and:', () => {
    beforeAll(() => {
      login.getPage()
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
      // log-in as the hero and make sure we hit the dashboard
      login.loginAndVerify(login.adminUser, login.adminPassword)
      // go to the academy license manage page via nav
      sidebar.academyButtonClick()
      // should get the license management page!
      browser.wait(EC.presenceOf(element(by.id('activeLicenseCount'))), 8000, 'never saw the license management page')
      // Wait until page has completed loading
      browser.wait(EC.invisibilityOf(licenseLoader), 5000, 'license management table did not load')
    })

    afterAll(() => {
      sidebar.logout()
    })

    it('should verify more than 1 license is in use', () => {
      // Find active license count on license mangagement page
      browser.wait(
        EC.presenceOf(element(by.id('activeLicenseCount'))),
        5000,
        'never saw the active licenses count on license management page',
      )
      // verify more than 1 license is in use
      let activeLicenseVal = element(by.id('activeLicenseCount'))
      browser.wait(EC.visibilityOf(activeLicenseVal), 3000, 'not able to find the active license value')
      activeLicenseVal.getText().then(count => {
        expect(parseInt(count.substring(0, 1))).toBeGreaterThanOrEqual(
          1,
          'active licenses value should be greater than or equal to 1',
        )
      })
    })

    it('should log in as an admin and verify more than 1 license is available', () => {
      // Find available license count on license mangagement page
      browser.wait(
        EC.presenceOf(element(by.id('availableLicenseCount'))),
        5000,
        'never saw the available licenses count on license management page',
      )
      // verify more than 1 license is available
      let availLicenseVal = element(by.id('availableLicenseCount'))
      browser.wait(EC.visibilityOf(availLicenseVal), 3000, 'not able to find the available license value')
      availLicenseVal.getText().then(count => {
        expect(count.substring(0, 1)).toBeGreaterThan(1, 'available licenses value is not greater than 1')
      })
    })

    it('should log in as an admin and successfully invite a teacher to join', () => {
      // Find invite fields
      browser.wait(
        EC.elementToBeClickable(element(by.id('licenseInviteNameInput'))),
        5000,
        'never found license invite name input',
      )
      // invite a teacher
      // Name
      let dateString: string = new Date().valueOf().toString()
      let uniqueName: string = 'fakeTeach-' + dateString + '-license'
      element(by.id('licenseInviteNameInput')).sendKeys(uniqueName)
      // Email
      element(by.id('licenseInviteEmailInput')).sendKeys('success+' + dateString + '@simulator.amazonses.com')
      //submit
      browser.wait(EC.elementToBeClickable(element(by.id('licenseInviteSubmitBtn'))), 5000)
      element(by.id('licenseInviteSubmitBtn')).click()

      // verify the invite was sent
      let invites = element.all(by.css('.educator-pending--name'))
      // when this next field goes blank, data was successfully sent to the server
      browser.wait(
        EC.textToBePresentInElement(element(by.id('licenseInviteNameInput')), ''),
        3000,
        'license invite never was sent to teacher',
      )
      // Verify new invite shows in table
      browser.wait(
        specificTextToBePresentInElement(invites.last(), uniqueName),
        5000,
        'never saw the latest license invite get added',
      )
    })

    it('should generate a correct invite link', async () => {
      browser.sleep(5000)
      // Scroll to top
      await browser.executeScript('window.scrollTo(0,0);')
      browser.wait(EC.elementToBeClickable(mgmt.copyInviteLink), 5000, 'never saw the invite link')
      // Get Academy invite link and save it for later
      let inviteLink = await mgmt.inviteLinkBox.getAttribute('value')
      // Verify invite link contains accept path
      expect(inviteLink).toContain('/license/accept')
      // Verify clicking "Copy" at least shows a success message
      mgmt.copyInviteLink.click()
      browser.wait(EC.visibilityOf(mgmt.copySuccessMsg), 3000, 'clicking to copy invite link did not show success message')
      // Browse to link
      browser.get(inviteLink)
      browser.wait(EC.elementToBeClickable(mgmt.joinAcademyBtn), 5000, 'invite link did show license accept page')
    })
  })

  var specificTextToBePresentInElement = function(elementFinder, nameText) {
    var hasText = function() {
      return elementFinder.getText().then(text => {
        return text
      })
    }
    return EC.and(EC.textToBePresentInElement(elementFinder, nameText))
  }
})
