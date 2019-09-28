/** Any properties stored server-side should be rendered on BaseUser */
export interface User extends BaseUser {
  isLoggedIn: boolean
  isStudent?: boolean
  profileIncomplete?: boolean
  type?: string
  createdAt: Date
  updatedAt: Date
  stripe_customer_id: string
}

export interface PublicUser {
  _id: string
  username?: string
  initials?: string
  avatar?: string
  fullname: string
  hero_status?: boolean
  userType?: string
}

/**
 *  The user we get back from the server
 *  If any properties are added on the front end, they should be added to the User interface
 */
interface BaseUser {
  _id: string
  username: string
  firstname: string
  lastname: string
  // fullname and initials are generally derived from first and last
  initials: string
  fullname: string
  email: string
  identities?: string[]
  hero_status?: boolean
  avatar?: string
  heard_about_us?: {
    source?: string
    detail?: string
  }
  prefs?: {
    recentEmoji?: string[]
    onboarding?: {
      highlighting?: {
        firstDone: number // this is really a date
        lastDone: number // also a date
      }
      newReading?: {
        firstDone: number // this is really a date
        lastDone: number // also a date
      }
      createReadingFromDash?: {
        firstDone: number // this is really a date
        lastDone: number // also a date
      }
    }
  }
  media?: {
    images?: { title: string; url: string }[]
    documents?: { title: string; pages: string[] }[]
  }
  referred_by?: string
  license_ids?: string[]
  institution_ids?: string[]
  isAcademyAdmin?: boolean
  // school_name: string, // @deprecated 3/26/2019
  school: UserSchoolDistrict
  phone_number: string
  archive_readings_before?: string
  oauth?: Array<{
    id: string
    type: string
    email?: string
  }>
  // User ids this user follows
  following?: string[]
}

export interface UserSchoolDistrict {
  school_id: string // these are not ObjectIds, but these are Ids from the NCES data collection
  school_name: string
  district_id: string // these are not ObjectIds, but these are Ids from the NCES data collection
  district_name: string
}
