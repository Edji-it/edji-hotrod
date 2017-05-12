import { Comment } from '.'

export interface Project {
  _id: string,
  reading_id: string,
  teacher_id: string,
  comments: Comment[],
  students_ids: string[],
  temp_ids: string[],
  label: string,
  code: string,
  types: string, // can currently be 'emoji' and 'text'
  heat_vision: boolean
}

