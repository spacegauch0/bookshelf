// @ts-check
import { writeFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";

const USER_ID = "46795449";
const SHELVES = ["read", "currently-reading", "to-read"];
const BASE_URL = "https://www.goodreads.com/review/list_rss";

async function fetchShelf(shelf, page = 1) {
  const url = `${BASE_URL}/${USER_ID}?shelf=${shelf}&per_page=200&page=${page}`;
  const res = await fetch(url);
  const text = await res.text();
  return text;
}

function decode(str) {
  if (!str) return "";
  if (typeof str !== "string") return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractText(val) {
  if (val === undefined || val === null) return "";
  if (typeof val === "string") return decode(val);
  if (typeof val === "number") return String(val);
  if (Array.isArray(val) && val.length > 0) {
    return extractText(val[0]);
  }
  if (typeof val === "object" && val["#text"] !== undefined) {
    return decode(String(val["#text"]));
  }
  return "";
}

function extractImageUrl(val) {
  const url = extractText(val);
  if (!url) return "";
  return url
    .replace(/\._SX50_\./, "._SX300_.")
    .replace(/\._SY75_\./, "._SY475_.")
    .replace(/\._SX98_\./, "._SX300_.")
    .replace(/\._SY160_\./, "._SY475_.")
    .replace(/\._SX318_\./, "._SX300_.");
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "#text",
  cdataPropName: "#text",
  preserveOrder: false,
  alwaysCreateTextNode: false,
});

async function main() {
  /** @type {Map<string, any>} */
  const booksMap = new Map();

  for (const shelf of SHELVES) {
    for (let page = 1; page <= 2; page++) {
      try {
        const xml = await fetchShelf(shelf, page);
        const parsed = parser.parse(xml);
        const channel = parsed.rss?.channel;
        if (!channel) continue;

        const items = channel.item;
        if (!items) continue;

        const list = Array.isArray(items) ? items : [items];

        for (const item of list) {
          const bookId = extractText(item.book_id);
          if (!bookId) continue;

          const existing = booksMap.get(bookId);

          const bookData = {
            id: bookId,
            title: extractText(item.title),
            author: extractText(item.author_name),
            isbn: extractText(item.isbn),
            imageUrl: extractImageUrl(item.book_large_image_url || item.book_medium_image_url || item.book_image_url),
            description: extractText(item.book_description),
            numPages: parseInt(extractText(item.book?.num_pages) || "0"),
            averageRating: parseFloat(extractText(item.average_rating) || "0"),
            published: extractText(item.book_published),
            userRating: parseInt(extractText(item.user_rating) || "0"),
            userReadAt: extractText(item.user_read_at),
            userDateAdded: extractText(item.user_date_added),
            userReview: extractText(item.user_review),
            shelves: existing?.shelves || [],
            goodreadsUrl: `https://www.goodreads.com/book/show/${bookId}`,
          };

          const shelfNames = extractText(item.user_shelves)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          if (shelfNames.length === 0 && shelf) {
            shelfNames.push(shelf);
          }

          const merged = {
            ...bookData,
            shelves: [...new Set([...bookData.shelves, ...shelfNames])],
          };

          booksMap.set(bookId, merged);
        }
      } catch (err) {
        console.error(`Error fetching ${shelf} page ${page}:`, err.message);
        console.error(err.stack);
      }
    }
  }

  const books = Array.from(booksMap.values());

  const shelfOrder = { read: 0, "currently-reading": 1, "to-read": 2 };
  books.sort((a, b) => {
    const aShelf = a.shelves.find((s) => s in shelfOrder);
    const bShelf = b.shelves.find((s) => s in shelfOrder);
    return (aShelf ? shelfOrder[aShelf] : 3) - (bShelf ? shelfOrder[bShelf] : 3);
  });

  writeFileSync("src/data/books.json", JSON.stringify(books, null, 2), "utf-8");

  console.log(`Fetched ${books.length} books`);
  console.log(`  Read: ${books.filter((b) => b.shelves.includes("read")).length}`);
  console.log(`  Currently reading: ${books.filter((b) => b.shelves.includes("currently-reading")).length}`);
  console.log(`  To-read: ${books.filter((b) => b.shelves.includes("to-read")).length}`);
}

main();
