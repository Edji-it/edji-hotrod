import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Account implements PageObjectInterface
{
    /*
    30 Jun 2017
    Last Modified: 3 July 2017
    Nicholas Pumper

    Page Object for the Account page.
    */

    // Public Instance Variables
    public avatarImg    = element(by.id('avatarImg'));
    public userInitials = element(by.id('userInitials'));
    public editBtn      = element(by.id('editAvatarBtn'));

    // Modal variables
    public avatarModal      = element(by.id("uploadAvatarModal"));
    public cancelUploadBtn  = element(by.id("cancelUploadBtn"));
    public saveAvatarBtn    = element(by.id("saveAvatarBtn"));    

    // get the login page
    getPage() : void 
    {
        browser.get('/#/account');
    } // getPage() : void

} // class Login