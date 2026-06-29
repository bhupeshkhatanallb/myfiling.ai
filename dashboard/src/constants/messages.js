// UI message strings

const MESSAGES = {
  UPLOAD: {
    TITLE: "Catch filing defects before submission.",
    SUBTITLE: "myfiling.ai checks your PDF against the Delhi High Court's formatting and registry-filing requirements — paper size, margins, type, pagination, index, court fee, vakalatnama, limitation, certified copy and affidavit. Get a filing-readiness score and a defect checklist in seconds.",
    DROPZONE_TITLE: "Drag your filing PDF here or click to browse",
    DROPZONE_SUB: "Cover page, index, synopsis, body and annexures — all in one PDF.",
    READY_TITLE: "Ready to analyse",
    READY_SUB: "We'll cross-reference rules for the selected court.",
    HINT: "Supported format: PDF only · Max size: 50MB",
    SAMPLE_LABEL: "Try a sample filing to explore",
  },
  ERROR: {
    UNSUPPORTED_TYPE: "Unsupported file type",
    PDF_ONLY: "myfiling.ai currently only accepts PDF files.",
    PARSE_ERROR: "Couldn't parse the PDF",
    PARSE_DETAILS: "The file is password-protected or contains only scanned images without OCR. We need a text-based PDF with extractable text.",
  },
  RESULTS: {
    NO_DEFECTS: "No defects found",
    DEFECT_COUNT: "defects found",
  },
};

export default MESSAGES;