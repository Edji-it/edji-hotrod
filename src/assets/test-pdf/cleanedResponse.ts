// Mapped OCR Data
<PageAnalysis>{
  document_id: "ID!",
  page: 1, // Page number of PDF
  dimensions: { // Values used to calculate percentages
    w: 400, // pixel width
    h: 800 // pixel height
  },
  wordboxes: [{
    x: 10, // percent x position
    y: 10, // percent y position
    w: 10, // percent width
    h: 10, // percent height
    str: "Hello"
  }],
  // Attach limit messages, etc
  warning: {
    message: "The maximum page limit of 3 was reached and only pages upto the limit were parsed successfully"
  },
  // Attach error message if FATAL
  error: {
    message: "Unable to process"
  },
  // Additional conversion log info
  doc_conversion: {
    ms: 1000,
    mb: 20 // size of full document
  }
}

// Mapped OCR Data
interface PageAnalysis {
  document_id: string // S3 UUID per page
  page: Number, // Page number of PDF
  dimensions: { // Values used to calculate percentages
    w: Number, // pixel width
    h: Number // pixel height
  },
  wordboxes: [{
    x: Number, // percent x position
    y: Number, // percent y position
    w: Number, // percent width
    h: Number, // percent height
    str: string
  }],
  // Attach limit messages, etc
  warning: {
    message: string
  },
  // Attach error message if FATAL
  error: {
    message: string
  },
  // Additional conversion log info
  doc_conversion: {
    ms: Number,
    mb: Number // size of full document
  }
}