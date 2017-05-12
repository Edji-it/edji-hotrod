/** Any properties stored server-side should be rendered on BaseUser */
export interface User extends BaseUser {

}

/**
 *  The user we get back from the server
 *  If any properties are added on the front end, they should be added to an interface extending this interface
 */
export interface BaseUser {
  username: string,
  fullname: string,
  email: string,
  identities: string[],
  prefs: {
    recentEmoji: string[],
    onboarding: {
      highlighting: {
        firstDone: Date,
        lastDone: Date
      }
    }
  },
  media: {
    images: { title: string, url: string }[],
    documents: { title: string, pages: string[] }[]
  }
}