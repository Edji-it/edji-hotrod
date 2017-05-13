import { EdjiComment } from '.'

/** Project properties we add on the front end */
export interface Project extends BaseProject {

}

/** The project object as it is returned from the server */
export interface BaseProject {
  _id: string,
  reading_id: string,
  teacher_id: string,
  comments: EdjiComment[],
  students_ids: string[],
  temp_ids: string[],
  label: string,
  code: string,
  types: string, // can currently be 'emoji' and 'text'
  heat_vision: boolean
}

