// Parses Kindle "My Clippings.txt" into annotations JSON
import { readFileSync, writeFileSync } from "node:fs";

const raw = readFileSync("src/data/clippings.txt", "utf-8");
const blocks = raw.split("==========").map((b) => b.trim()).filter(Boolean);

const books = {};

for (const block of blocks) {
  const lines = block.split("\n").filter((l) => l.trim());
  if (lines.length < 2) continue;

  const header = lines[0].replace(/^\uFEFF/, "").trim();
  const meta = lines[1].trim();
  const text = lines.slice(2).join(" ").trim();

  if (!meta.startsWith("- Tu") || !text) continue;

  // Parse: "Book Title [ID] (Author)"
  const titleMatch = header.match(/^(.+?)(?:\s*\[[\d-]+\])?\s*\((.+)\)$/);
  if (!titleMatch) continue;

  const title = titleMatch[1].trim();
  const author = titleMatch[2].trim();

  // Parse location or page
  const locMatch = meta.match(/posición\s*(\d+[-–]\d+)/i) || meta.match(/location\s*(\d+[-–]\d+)/i);
  const pgMatch = meta.match(/página\s*(\d+)/i) || meta.match(/page\s*(\d+)/i);

  let location = "";
  if (locMatch) location = "Loc " + locMatch[1];
  else if (pgMatch) location = "Page " + pgMatch[1];

  if (!books[title]) {
    books[title] = {
      title,
      author,
      annotations: [],
    };
  }

  books[title].annotations.push({
    text,
    locationPercentage: location,
  });
}

const result = Object.values(books);
writeFileSync("src/data/clippings-annotations.json", JSON.stringify(result, null, 2), "utf-8");
console.log(`Parsed ${result.length} books with ${result.reduce((s, b) => s + b.annotations.length, 0)} highlights`);
