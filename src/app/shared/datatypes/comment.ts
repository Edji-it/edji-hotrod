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
  data: string,
  author: string,
  type: string,
  text?: string,
  loc?: { x: number, y: number }
}

// how do you make an enum that can be used by an interface to specify string values?
// export enum CommentType {
//   emojiComment = 0,
//   textComment
// }

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
  userRef: {
    [_id: string]: {
      fullname: string,
      count: number
    }
  }
}