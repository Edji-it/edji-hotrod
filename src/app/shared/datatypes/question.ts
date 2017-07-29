/*
  Data and logic for Questions inserted into a reading.
  29 July 2017
  Nick Pumper

  Last modified: 29 July 2017
*/

/* Additional properties we add on the front end */
interface Question extends BaseQuestion {
  
} // interface Question

/** The reading as it is returned from the server */
interface BaseQuestion {
  prompt: string,
  emojiAnswers : boolean,
  textAnswers : boolean;
} //  interface BaseQuestion

// Conduct the logic behind the question in this class
export class EdjiQuestion implements Question {

  // Integral State
  public prompt: string; // What is the question asking.

  // Answer types.
  public emojiAnswers : boolean;
  public textAnswers : boolean;
} // export class EdjiQuestion 