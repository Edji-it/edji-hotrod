/**
 * Leaderboard/Student Panel tests
 */
import { browser, by, element, protractor } from 'protractor';

import { Project, Sidebar } from './page-objects';
import { LoginModal } from './components';
import { Home } from "./page-objects/home-page";

describe('Project Page as an owner wishing to filter by student: ', () => {

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

    it("should open the Leaderboard and filter by student", () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header");
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.clickawaySquare.isPresent()).toBeFalsy();

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000, "never found button to go to account login");
        loginModal.gotoAccountLoginButton.click();
        expect(loginModal.clickawaySquare.isPresent()).toBeTruthy();
        loginModal.usernameInput.sendKeys('testhero');
        loginModal.passwordInput.sendKeys('testhero16');
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000, "never found the account login button on modal");
        
        loginModal.accountLoginButton.submit();

        // Need to check for and click the owner tools button if its showing
        sidebar.ownerToolToggle();
        
        // Open Leaderboard
        browser.wait(EC.elementToBeClickable(sidebar.leaderboardButton), 5000, "never found the leaderboard owner tool button")
        sidebar.leaderboardButton.click();

        // Get comment count
        let totalCount: number
        element.all(by.css('edji-comment:not(.hidden)'))
            .count()
            .then((count) => {
                totalCount = count
            })
            
        // Wait for filters to be available
        browser.wait(EC.elementToBeClickable(element(by.id("studentFilterBtn0"))), 3000, "never saw student filter buttons in leaderboard")

        // Filter by "First Commenter"'s comments
        let firstCommenterFilter = element(by.cssContainingText('.user-list__name', 'First Commenter')).element(by.xpath('..')).element(by.css('.e2e-student-filter'))
        browser.wait(EC.elementToBeClickable(firstCommenterFilter), 3000, "First Commenter's student filter did not become clickable")
        firstCommenterFilter.click()

        // First Commenter should only have one comment
        let firstCommenterComments = element.all(by.css('.e2e-comment--First-Commenter .user-icon')) // User icon is a more reliable indicator of visibility
        browser.wait(EC.visibilityOf(firstCommenterComments.first()), 3000, 'not able to see First Commenter\'s comment when filtering')
        firstCommenterComments.count()
            .then((count) => {
                expect(count).toBe(1, 'found more or less than First Commenter\'s single comment despite filtering')
            })
        // Paginate to previous Student
        browser.wait(EC.elementToBeClickable(sidebar.prevStudentButton), 5000, 'never saw \"previous\" student filter button')
        sidebar.prevStudentButton.click()
        // First commenter's comment should no longer be visible
        browser.wait(EC.invisibilityOf(firstCommenterComments.first()), 5000, 'previous student filter did not hide previous student\'s comments')
        // Close student filter
        sidebar.studentFilterClose.click()
        // Ensure First Commenter's comment is visible again
        browser.wait(EC.elementToBeClickable(firstCommenterComments.first()), 3000, 'never saw First Commenter\'s comment after clearing')
        // Ensure all comments are showing again
        element.all(by.css('edji-comment:not(.hidden)'))
            .count()
            .then((count) => {
                expect(count == totalCount).toBeTruthy('all comments did not show after clearing student filter')
            })
    })   
})