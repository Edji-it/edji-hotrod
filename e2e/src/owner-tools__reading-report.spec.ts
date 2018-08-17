/**
 * Reading Report Tests
 */
import { browser, by, element, protractor } from 'protractor';

import { Project, Sidebar } from './page-objects';
import { LoginModal } from './components';
import { Home } from "./page-objects/home-page";

describe('Project Page as an owner using reading report: ', () => {

    /* ---- Variable Initialization --------------- */
    let project = new Project();
    let loginModal = new LoginModal();
    let sidebar = new Sidebar();
    let home = new Home();
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */

    beforeEach(() => {
        // Id for Owner Tools Test Reading owned by Teach/Teach
        browser.get("/#/home");
        // Open Test project
        home.enterProjectCodeFromHome('testhero')
    });

    afterEach(() => {
        // log out
        sidebar.logout();
    });

    /* ---- Project Tests ------------------------- */

    it("should open the reading report and ", () => {
      
    })   
})