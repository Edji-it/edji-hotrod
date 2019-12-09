import { BaseUser } from 'edji-types'

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
