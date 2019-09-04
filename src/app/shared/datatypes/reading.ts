import { Project, EdjiQuestion } from '.'

/** Reading with any additional properties we add on the front end */
export interface Reading extends BaseReading {
  projects?: Project[]
  version_count?: number
  archived?: boolean
  archivedBegin?: boolean
  archivedEnd?: boolean
}

/*
  Last modified: 29 May 2017
*/

/** The reading as it is returned from the server */
export interface BaseReading {
  html?: string
  words?: {
    str?: string
    styles?: string[]
    url?: string
    a?: boolean // link
    img?: boolean // image
    q?: boolean // question
    s?: boolean // space
    boxes?: any[]
  }[]
  title: string
  instructions?: string
  owner_id?: string
  public?: boolean
  promoter_ids?: string[]
  source?: string
  cover_img?: string
  draft: boolean
  parent_id?: string
  version_id?: string
  _id: string
  questions?: EdjiQuestion[]
  grade_levels?: number[]
  subjects?: string[]
  heroic?: boolean
  createdAt?: string
  updatedAt?: string
  owner_bookmarked?: boolean
}
