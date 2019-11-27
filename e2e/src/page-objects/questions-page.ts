import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class Questions implements PageObjectInterface {
  /*
    8 Aug 2017
    Last Mod: 8 Aug 2017

    Easily reference parts of the project page test page.
    */

  // Testing Open Ended Answers
  // NOTE: All the following variables are under testQuestion
  public testQuestion = element(by.id('59bdac9aecc9ef57c04d6794')) // Get the testQuestion by it's id, which is it's question._id
  public openEndedAnswerBlock = this.testQuestion.element(by.id('openEndedAnswers'))
  public answerBlock = element(by.id('answerBlock')) // Where the answers are displayed
  public answerOptions = element(by.id('answerInput'))

  // Comment variables
  public emojiCommentBtn = element.all(by.css('button.emoji.button__answer-type')).first()
  public commentActionSave = element(by.id('keyboardDoneBtn'))
  public textCommentBtn = this.answerOptions.element(by.css('.text.button__answer-type'))
  public firstQuestion = element(by.id('question-1'))
  public firstAnswer = this.firstQuestion.element(by.css('edji-comment'))
  public firstAnswerDelete = this.firstAnswer.element(by.css('.e2e-delete-button'))
  public textCommentInput = element.all(by.css('.answerCommentBlock .text-comment-input:not(.disabled)')).first()

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    browser.get('/#')
    // Load a good sample Project with Questions
    browser.get('/#/project/questions')
  } // public getQuestionsPage() : void {
} // class
