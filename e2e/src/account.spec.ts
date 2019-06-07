import { browser, by, element, protractor } from 'protractor'
import { Account, Login } from './page-objects'
import * as path from 'path'
import { Sidebar } from './page-objects/sidebar-page'

describe('Account Page', () => {
  let EC = protractor.ExpectedConditions // vital
  let account = new Account()
  let login = new Login()
  let sidebar = new Sidebar()

  beforeAll(() => {
    login.getPage()
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.enterUsername(login.heroUser)
    login.enterPassword(login.heroPassword)
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.loginButton.click()
    browser.wait(EC.urlContains('dashboard'), 5000, 'never arrived at dashboard')
    sidebar.clickAccountButton()
    browser.wait(EC.urlContains('account'), 5000, 'never arrived at account page')
  })

  afterEach(() => {
    browser.manage().logs().get('browser').then(browserLog => {
      if (browserLog.length > 0) {
        browserLog.forEach(log => {
          console.error(log.message)
        })
      }
    })
  })

  describe('Hero Management', () => {
    it('Hero user should see subscription options', () => {
      // make sure there is no avatar
      browser.wait(EC.visibilityOf(account.heroModifyBtn), 5000, 'should see modify subscription button')
    })
  })

  // Created 7.3.17
  // describe('Avatars', () => {

  //     // 7.3.17
  //     it('Avatar picture should not be visible, and user initials should be instead', () => {
  //         // make sure there is no avatar
  //         browser.wait(EC.invisibilityOf(account.avatarImg), 5000, "should not be able to see the avatar image");
  //         browser.wait(EC.visibilityOf(account.userInitials), 5000, "should be able to see the user initials");
  //     });

  //     // 7.3.17
  //     describe('Changing Avatars', () => {
  //         it('Clicking "Cancel" on the modal should not set an avatar', () => {
  //             // Make sure there is no avatar
  //             browser.wait(EC.invisibilityOf(account.avatarImg), 2000, "should not be able to see the avatar image");

  //             // open the upload modal
  //             account.openModal();

  //             // In the modal...
  //             browser.wait(EC.presenceOf(account.cancelUploadBtn), 5000, "should be able to see the cancel upload button.");
  //             account.cancelUploadBtn.click();

  //             // I want to see the modal gone. like my ex-wife.
  //             browser.wait(EC.invisibilityOf(account.avatarModal), 5000, "should not be able to see the upload avatar modal.");
  //         }); // it('Clicking "Cancel" on...

  //         it('Upload an Avatar, then remove it from the modal.', () => {
  //             // Make sure there is no avatar
  //             browser.wait(EC.invisibilityOf(account.avatarImg), 2000, "should not be able to see the avatar image");

  //             // open the upload modal
  //             account.openModal();

  //             browser.wait(EC.invisibilityOf(account.uploadedPic), 7000, "should NOT be able to see an uploaded avatar.");

  //             // upload the test image
  //             // NOTE: consolidate this into one function in the page object.
  //             let absolutePath = path.resolve(__dirname, account.testAvatarToUpload);
  //             account.imageFileInput.sendKeys(absolutePath);

  //             // Wait for the image to upload
  //             browser.wait(EC.visibilityOf(account.uploadedPic), 10000, "should be able to see uploaded avatar.");

  //             // now remove that thing off the face of the Earth
  //             browser.wait(EC.presenceOf(account.removeBtn), 5000, "should be able to see the remove button.");
  //             account.removeBtn.click();
  //             browser.wait(EC.invisibilityOf(account.uploadedPic), 7000, "should NOT be able to see uploaded avatar.");

  //             account.closeModal(); // close this for the next test

  //             // Make sure there is no avatar
  //             browser.wait(EC.invisibilityOf(account.avatarImg), 2000, "should not be able to see the avatar image");
  //         }); // it('Upload an Avatar, then remove it from the modal...

  //         it('Upload an Avatar, save it, then remove it.', () => {
  //             account.getPage();

  //             // open the upload modal
  //             account.openModal();

  //             browser.wait(EC.invisibilityOf(account.uploadedPic), 5000, "should NOT be able to see an uploaded avatar.");

  //             // upload the test image
  //             // NOTE: consolidate this into one function in the page object.
  //             browser.wait(EC.presenceOf(account.imageFileInput), 5000, "should NOT be able to see the imageFileInput.");
  //             let absolutePath = path.resolve(__dirname, account.testAvatarToUpload);
  //             account.imageFileInput.sendKeys(absolutePath);

  //             // Wait for the image to upload
  //             browser.wait(EC.visibilityOf(account.uploadedPic), 10000, "should be able to see uploaded avatar.");

  //             // hit it, Fergie
  //             browser.wait(EC.visibilityOf(account.saveAvatarBtn), 7000, "should be able to see the saveAvatarBtn.");
  //             account.saveAvatarBtn.click();

  //             // I want to see the modal gone. like my ex-wife.
  //             browser.wait(EC.invisibilityOf(account.avatarModal), 5000, "should not be able to see the upload avatar modal.");

  //             // I want to see a goddamn avatar
  //             browser.wait(EC.visibilityOf(account.avatarImg), 5000, "should be able to see the avatar.");

  //             // open the upload modal
  //             account.openModal();

  //             // now remove that pic off the face of the Earth
  //             browser.wait(EC.presenceOf(account.removeBtn), 5000, "should be able to see the remove button.");
  //             account.removeBtn.click();
  //             browser.wait(EC.invisibilityOf(account.uploadedPic), 7000, "should NOT be able to see uploaded avatar.");

  //             // hit it, Fergie
  //             browser.wait(EC.visibilityOf(account.saveAvatarBtn), 7000, "should be able to see the saveAvatarBtn.");
  //             account.saveAvatarBtn.click();

  //             // I want to see the modal gone. like my ex-wife.
  //             browser.wait(EC.invisibilityOf(account.avatarModal), 5000, "should not be able to see the upload avatar modal.");
  //         }); // it('Upload an Avatar, save it, then remove it...
  //     }); // describe Changing Avatars
  // }); // describe('Avatars',
}) // describe 'Account Page'
