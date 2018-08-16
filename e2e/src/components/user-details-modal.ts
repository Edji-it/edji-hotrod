import { browser, by, element, protractor } from 'protractor';

export class UserDetailsModal {
    private EC = protractor.ExpectedConditions

    public modal = element(by.id("userDetailsModal"))
    public teacherOption = element(by.id("typeTeacherInput"))
    public studentOption = element(by.id("typeStudentInput"))
    public businessOption = element(by.id("typeBusinessInput"))
    public personalOption = element(by.id("typePersonalInput"))
    public robotOption = element(by.id("typeRobotInput"))
    public otherOption = element(by.id("typeOtherInput"))
    public submitButton = element(by.id("submitDetailsButton"))
    

  /**
   * Complete User Details (defaults to Bot)
   */
  public confirmBot(type?: string): void {
    browser.wait(this.EC.elementToBeClickable(this.robotOption), 5000, "Robot account type option not clickable after loading user details modal")
    this.robotOption.click()
    // Certain site functionality is only available to teachers
    if (type === 'teacher') {
      this.teacherOption.click()
    } else if (type === 'student') {
      this.studentOption.click()
    }
    browser.wait(this.EC.elementToBeClickable(this.submitButton), 5000, "'Submit' button not clickable after selecting account type option")
    this.submitButton.click()
    browser.wait(this.EC.invisibilityOf(this.modal), 5000, "user details modal did not close after completion")
  }
}