import { browser, by, element, protractor } from 'protractor'

export class StudentList {
  public studentListFirstSettings = element.all(by.css('.e2e-student-settings')).first()
  public settingsOptionPromote = element(by.id('promoteCoTeacherOption'))
  public confirmCoTeacherButton = element(by.id('confirmCoTeacherBtn'))
  public coTeacherTooltip = element(by.id('coTeacherTooltip'))
}
