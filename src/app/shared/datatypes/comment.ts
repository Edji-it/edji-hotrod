import { BaseComment } from 'edji-types'
/*  
  Last Mod: 8.5.17
*/

/**
 * Commment, client-side
 * - Extends server data "base comment"
 */
export interface EdjiComment extends BaseComment {
  // Client-side properties
  lineCount: number
  expanded: boolean
  project_id: string
  active: boolean
  authorIsTeacher: boolean
  imagePos: number
  selected: boolean
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
  status: userReadingStatus
  questions?: any[]
}

export interface iCommentStats {
  comment_count: number
  comment_max: number
  comment_min: number
  comment_avg: number
  reply_count: number
  userStats: UserCommentStats[]
}

export type userReadingStatus = 'offline' | 'idle' | 'active'
