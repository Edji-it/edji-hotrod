import { PageObjectInterface } from "./PageObjectInterface";
import { element, by, browser } from "protractor";


export class AcademyMgmt implements PageObjectInterface {
    
    public copyInviteLink = element(by.id('buttonCopylink'))
    public inviteLinkBox = element(by.id('copyShareLink'))
    public copySuccessMsg = element(by.id('linkCopySuccess'))

    // License accept
    public joinAcademyBtn = element(by.css('[data-test="joinAcademyBtn"]'))

    // get the license mgmt page
    getPage(): void {
        browser.get('/#/academy/licenses')
    } // getPage() : void

}