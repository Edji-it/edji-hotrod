import { Project, EdjiQuestion } from '.'

/** Reading with any additional properties we add on the front end */
export interface Reading extends BaseReading {
  projects?: Project[],
  versionCount?: number
}

/*
  Last modified: 29 May 2017
*/

/** The reading as it is returned from the server */
export interface BaseReading {
  html?: string,
  words?: any[],
  title: string,
  owner_id?: string,
  teacher_ids?: string[],
  public?: boolean,
  promoter_ids?: string[],
  source?: string,
  cover_img?: string,
  draft: boolean,
  version_id?: string,
  _id: string,
  questions?: EdjiQuestion[]
}