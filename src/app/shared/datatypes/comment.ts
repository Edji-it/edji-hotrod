import { EdjiQuestion } from './';

/*  
  Last Mod: 8.2.17
*/

/** Comment properties we add on the front end */
export interface EdjiComment extends BaseComment {
  lineCount: number,
  expanded: boolean,
  project_id: string,
  active: boolean,
  showAvatar: boolean
}

/** Comment properties we get from the server */
export interface BaseComment {
  _id: string,
  user_id: string,
  start: number,
  end: number,
  data: any,
  author: string,
  type: string,   // emoji, text, or audio comment?
  dataArray?: any[],
  url?: string,
  text?: string,
  loc?: { x: number, y: number },
  reply_to?: string,
  replies?: any[],
  questionId? : string,
  new?: boolean
}

// idk if we'll use this, but I made it anyways? 8.2.17 Nick Pumper
export enum CommentType {
  Normal, // A normal comment nested in the reading text.
  Reply,  // A comment replying to another comment.
  Answer  // A comment which is an answer to an EdjiQuestion.
} // export enum CommentType

/** Used to control permissions on altering comment data */
export enum CommentPermissions {
  READ = 1,
  DELETE = 3,
  EDIT = 5,
  ADMIN = 10
}

/** Keep the comment stats reliable and defined */
export interface iCommentStats {
  count: number,
  userStats: { _id: string, fullname: string, count: number }[]
  // userRef: {
  //   [_id: string]: {
  //     fullname: string,
  //     count: number
  //   }
  // }
}