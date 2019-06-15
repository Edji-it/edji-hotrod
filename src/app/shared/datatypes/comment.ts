/*  
  Last Mod: 8.5.17
*/

/** Comment properties we add on the front end */
export interface EdjiComment extends BaseComment {
  lineCount: number
  expanded: boolean
  project_id: string
  active: boolean
  showAvatar: boolean
  imagePos: number
  selected: boolean
  question_number?: number
  createdAt?: Date
  updatedAt?: Date
}

/** Comment properties we get from the server */
export interface BaseComment {
  _id: string
  user_id: string
  start: number
  end: number
  data: any
  author: string
  type: string // emoji, text, or audio comment?
  dataArray?: any[]
  url?: string
  text?: string
  loc?: { x: number; y: number }
  box?: { start: number; end: number } // Hit box/word indices for images/pdfs
  lineY?: number // Used to get comments for a line (annotator, comment pane)
  imageY?: number // Used for positioning of comments in rows on images
  reply_to?: string
  replies?: any[]
  questionId?: string
  prompt?: string
  new?: boolean
}

/** Used to control permissions on altering comment data */
export enum CommentPermissions {
  READ = 1,
  DELETE = 3,
  EDIT = 5,
  ADMIN = 10,
}

/** Keep the comment stats reliable and defined */

export interface UserCommentStats {
  _id: string
  fullname: string
  comment_count: number
  reply_count: number
  emoji_comment_count: number
  text_comment_count: number
  audio_comment_count: number
  comments?: EdjiComment[]
}

export interface iCommentStats {
  comment_count: number
  comment_max: number
  comment_min: number
  comment_avg: number
  reply_count: number
  userStats: UserCommentStats[]
}
