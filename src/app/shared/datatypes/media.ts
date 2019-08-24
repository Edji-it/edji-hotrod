export interface DocumentSpark {
  uuid?: string
  pages?: string[]
  converted: boolean
  updatedTime?: number
  pdf?: {
    location?: string
    converted: boolean
    convertTime?: string
    pages?: string[]
  }
  error?: any
  // Client-side only
  requestedTime?: number
  expired?: boolean
  disable_words?: boolean
}
