/** License properties we add on the front end */
export interface License extends BaseLicense {
  
}

/** The license object as it is returned from the server */
interface BaseLicense {
  _id: string,
  license_type: string,
  max_users: number,
  owning_institution: string,
  pending_invitations: { _id: string, email: string, expiration: Date, name: string, role: string }[],
  roles: { _id: string, role: string, user_id: string }[]
}

export interface LicenseInvite {
  email: string,
  educator: string,
  role: string,
  expiration?: Date,
  _id?: string
}

