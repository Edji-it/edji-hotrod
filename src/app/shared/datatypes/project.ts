import { EdjiComment, User } from '.'
import { Reading } from './reading'
import { PublicUser } from './user'

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

/** The project object as it is returned from the server */
interface BaseProject {
  _id: string
  reading_id: Reading
  teacher: User
  teacher_id: any
  co_owner_ids?: string[]
  owner_id: any
  comments: EdjiComment[]
  answers?: EdjiComment[]
  students_ids: string[] // server populates the ids with this object
  temp_ids: string[] // same as above with temp_ids
  label: string
  code: string
  types: string // can currently be 'emoji' and 'text'
  heat_vision: boolean
  report_evals?: Feedback[]
  group_instructions?: string
  createdAt?: string
  updatedAt?: string
}

export interface Feedback {
  createdAt: Date
  evaluation: string
  user_id: string
  _id: string
}
