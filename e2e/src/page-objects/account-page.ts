import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class Account implements PageObjectInterface {
  /*
    30 Jun 2017
    Last Modified: 3 July 2017
    Nicholas Pumper

    Page Object for the Account page.
    */

  private EC = protractor.ExpectedConditions

  // Public Instance Variables
  public avatarImg = element(by.id('avatarImg'))
  public userInitials = element(by.id('userInitials'))
  public editBtn = element(by.id('editAvatarBtn'))

  // Modal variables
  public avatarModal = element(by.id('uploadAvatarModal'))
  public cancelUploadBtn = element(by.id('cancelUploadBtn'))
  public closeModalBtn = element(by.id('closeModalBtn'))
  public saveAvatarBtn = element(by.id('saveAvatarBtn'))
  public removeBtn = element(by.id('removeBtn'))
  public imageFileInput = element(by.id('imageFileInput'))
  public uploadedPic = element(by.id('uploadedPic'))

  // Hero Management
  public heroModifyBtn = element(by.id('heroModifyBtn'))

  public testAvatarToUpload: string = '../../assets/test-avatar/shia.jpg'

  // get the login page
  getPage(): void {
    browser.get('/#/account')
  } // getPage() : void

  openModal(): void {
    browser.wait(this.EC.presenceOf(this.editBtn), 5000, 'should be able to see the edit button')
    this.editBtn.click()
    browser.wait(this.EC.visibilityOf(this.avatarModal), 5000, 'should be able to see the upload avatar modal.')
    return
  } // openModal () : void

  closeModal(): void {
    browser.wait(this.EC.visibilityOf(this.avatarModal), 5000, "can't close the modal if it's not open.")
    this.closeModalBtn.click()
    browser.wait(this.EC.invisibilityOf(this.avatarModal), 5000, 'should not be able to see the upload avatar modal.')
  } // closeModal () : void
} // class Login
