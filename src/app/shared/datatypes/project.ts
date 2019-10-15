import { BaseProject, PublicUser } from 'edji-types'

/** Project properties we add on the front end */
export interface Project extends BaseProject {
    students: PublicUser[] // front end properties to add more reference info to students
    temps: PublicUser[] // front end properties to add more reference info to temps
    co_owners: PublicUser[]
    owners: PublicUser[]
    // Front end convenience flags
    archived?: boolean
    isTeaching?: boolean
  }
  