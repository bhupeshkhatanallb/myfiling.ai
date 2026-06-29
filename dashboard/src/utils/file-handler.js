// File upload and validation logic

function validatePdfFile(file) {
  if (!file) return null;
  if (!/\.pdf$/i.test(file.name)) {
    return {
      valid: false,
      error: {
        title: "Unsupported file type",
        details: `Received "${file.name}". myfiling.ai currently only accepts PDF files.`,
      },
    };
  }
  return { valid: true };
}

function formatFileSize(bytes) {
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `${mb} MB`;
}

function createFileObject(file) {
  return {
    name: file.name,
    size: formatFileSize(file.size),
  };
}

export { validatePdfFile, formatFileSize, createFileObject };