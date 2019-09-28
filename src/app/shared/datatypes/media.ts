export interface DocumentSpark {
  title?: string
  uuid?: string
  pages?: string[]
  converted: boolean
  updatedTime?: number
  pdf?: {
    location?: string
    pages?: string[]
  }
  error?: any
  // Client-side only
  requestedTime?: number
  expired?: boolean
  disable_words?: boolean
}

export interface DocumentAnalysisData {
  page: 0
  word_boxes: WordBox[]
  doc_conversion?: any
}

export interface WordBox {
  x: number
  y: number
  w: number
  h: number
  str: string
}
