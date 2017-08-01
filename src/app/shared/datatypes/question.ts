import { EdjiComment } from "./";

/*
  Data and logic for Questions inserted into a reading.
  29 July 2017
  Nick Pumper

  Last modified: 1 Aug 2017
*/

/* Additional properties we add on the front end */
interface Question extends BaseQuestion {
  deleteAnswer(target: EdjiComment) : void;
} // interface Question

/** The reading as it is returned from the server */
interface BaseQuestion {
  prompt        : string,
  emojiAnswers  : boolean,
  textAnswers   : boolean;
  answers       : EdjiComment[];
} //  interface BaseQuestion

// Conduct the logic behind the question in this class
export class EdjiQuestion implements Question {

  // State
  public prompt   : string; // What is the question asking.
  public answers  : EdjiComment[] = []

  // Answer types.
  public emojiAnswers : boolean;
  public textAnswers : boolean;

  constructor () {
    // console.log(this.answers);
  } // constructor

  public deleteAnswer (target : EdjiComment) : void {
    console.log("Deleting!");
    this.answers.splice(this.answers.indexOf(target), 1);
  } // public deleteAnswer (target : EdjiComment)
} // export class EdjiQuestion 