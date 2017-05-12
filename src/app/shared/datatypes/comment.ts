export interface Comment {
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