import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Questions implements PageObjectInterface {

    /*
    8 Aug 2017
    Last Mod: 8 Aug 2017
    
    Easily reference parts of the project page test page.
    */

    // Testing Open Ended Answers
    // NOTE: All the following variables are under testQuestion
    public testQuestion         = element(by.id("598a2313fed26c49c90a278a")); // Get the testQuestion by it's id, which is it's question._id
    public openEndedAnswerBlock = this.testQuestion.element(by.id("openEndedAnswers"));
    public answerOptions        = this.testQuestion.element(by.repeater("type of answerTypes"));
    public emojiCommentBtn      = element.all(by.css(".button__answer-type")).first();
    public textCommentBtn       = this.openEndedAnswerBlock.element(by.id("answerOptiontext"));

    public getPage() : void {
        // First we clear out the url (sometimes page is preserved if the url stays the same)
        browser.get("/#");
        // Load a good sample Project with Questions
        browser.get("/#/project/wv4f");
    } // public getQuestionsPage() : void {
} // class