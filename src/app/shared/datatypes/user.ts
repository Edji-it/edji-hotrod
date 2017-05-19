/** Any properties stored server-side should be rendered on BaseUser */
export interface User extends BaseUser {
  isLoggedIn: boolean
}

/**
 *  The user we get back from the server
 *  If any properties are added on the front end, they should be added to the User interface
 */
interface BaseUser {
  _id: string,
  username: string,
  fullname: string,
  email: string,
  identities?: string[],
  prefs?: {
    recentEmoji?: string[],
    onboarding?: {
      highlighting?: {
        firstDone: number, // this is really a date
        lastDone: number // also a date
      }
    }
  },
  media?: {
    images?: { title: string, url: string }[],
    documents?: { title: string, pages: string[] }[]
  }
}