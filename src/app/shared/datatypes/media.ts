export interface DocumentSpark {
  uuid?: string
  pages?: string[]
  converted: boolean
  updatedTime?: string
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
  disableWords?: boolean
}
