import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export class FileValidationError extends Error {}

function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

export function validateResumeFile(file: File): void {
  const ext = getExtension(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    throw new FileValidationError("Only PDF or TXT files are supported.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileValidationError("File is too large. Please upload a file under 8MB.");
  }
  if (file.size === 0) {
    throw new FileValidationError("This file appears to be empty.");
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pageTexts.push(text);
  }

  return pageTexts.join("\n").trim();
}

async function extractTextFromTxt(file: File): Promise<string> {
  return (await file.text()).trim();
}

export async function extractResumeText(file: File): Promise<string> {
  validateResumeFile(file);
  const ext = getExtension(file.name);

  const text = ext === ".pdf" ? await extractTextFromPdf(file) : await extractTextFromTxt(file);

  if (!text || text.trim().length < 20) {
    throw new FileValidationError(
      "We couldn't extract enough readable text from this file. Try a different file or paste your resume as text."
    );
  }

  return text;
}
