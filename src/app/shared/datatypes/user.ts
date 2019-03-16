/** Any properties stored server-side should be rendered on BaseUser */
export interface User extends BaseUser {
  isLoggedIn: boolean,
  isStudent?: boolean,
  type?: string,
  createdAt: Date,
  updatedAt: Date,
  stripe_customer_id: string
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
  hero_status?: boolean,
  prefs?: {
    recentEmoji?: string[],
    onboarding?: {
      highlighting?: {
        firstDone: number, // this is really a date
        lastDone: number // also a date
      },
      newReading?: {
        firstDone: number, // this is really a date
        lastDone: number // also a date
      },
      createReadingFromDash?: {
        firstDone: number, // this is really a date
        lastDone: number // also a date
      }
    }
  },
  media?: {
    images?: { title: string, url: string }[],
    documents?: { title: string, pages: string[] }[]
  },
  avatar?: string,
  referred_by?: string,
  license_ids?: string[],
  institution_ids?: string[],
  isAcademyAdmin?: boolean,
  school_name: string,
  phone_number: string,
  archive_readings_before?: string
  oauth?: Array<{
    id: string
    type: string
    email?: string
  }>
}