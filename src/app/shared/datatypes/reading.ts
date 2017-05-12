export interface Reading {
  html: string,
  words: any[],
  title: string,
  owner_id: string,
  teacher_ids: string[],
  public: boolean,
  promoter_ids?: string[],
  source?: string,
  cover_img?: string,
  draft: boolean,
  version_id: string
}