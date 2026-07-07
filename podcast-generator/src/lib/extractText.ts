import mammoth from "mammoth";

// pdf-parse doesn't have great ESM types; require keeps it simple in a route handler
const pdfParse = require("pdf-parse");

const MAX_CHARS = 60_000; // guardrail so one giant document can't blow up LLM cost

export async function extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  let text = "";

  if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (mimeType === "text/plain" || filename.endsWith(".txt") || filename.endsWith(".md")) {
    text = buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
  }

  text = text.trim();
  if (!text) {
    throw new Error("Couldn't extract any text from this file — it may be a scanned image PDF.");
  }

  return text.slice(0, MAX_CHARS);
}
