import { EdjiComment } from './'

/*
  Data and logic for Questions inserted into a reading.
  29 July 2017
  Nick Pumper

  Last modified: 2 Aug 2017
*/

/* Additional properties we add on the front end */
interface Question extends BaseQuestion {
  question_number: number
  new?: boolean
} // interface Question

/** The reading as it is returned from the server */
interface BaseQuestion {
  _id: string
  prompt: string
  answer_types: any[]
  option_types: any[]
  answers?: EdjiComment[]
} //  interface BaseQuestion

// Conduct the logic behind the question in this class
export class EdjiQuestion implements Question {
  // State
  public _id: string
  public prompt: string // What is the question asking.
  public answer_types: any[] = []
  public option_types: any[] = []
  public answers: EdjiComment[] = [] // the answers to the question.
  public new: boolean
  public question_number: number

  // Answer types.
  public answerType: string

  constructor() {
    // console.log(this.answers);
  } // constructor
} // export class EdjiQuestion
