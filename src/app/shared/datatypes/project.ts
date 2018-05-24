import { EdjiComment } from '.'

/** Project properties we add on the front end */
export interface Project extends BaseProject {

}

/** The project object as it is returned from the server */
interface BaseProject {
  _id: string,
  reading_id: string,
  teacher_id: any,
  owner_id: any,
  comments: EdjiComment[],
  answers?: EdjiComment[],
  students_ids: { _id: string, fullname: string }[], // server populates the ids with this object
  temp_ids: { _id: string, fullname: string }[], // same as above with temp_ids
  label: string,
  code: string,
  types: string, // can currently be 'emoji' and 'text'
  heat_vision: boolean
}

