import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import seed from "@/data/books.json";
import { type Catalog, CatalogSchema } from "./schema";

/**
 * Where the catalog lives.
 *
 * - Production (BLOB_READ_WRITE_TOKEN set): a private JSON file in Vercel Blob.
 *   The first read seeds it from data/books.json.
 * - Local development (no token): data/books.json itself, so edits made in the
 *   admin area show up as a normal git diff.
 */
const BLOB_PATHNAME = "catalog/books.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "books.json");

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "אין אחסון מוגדר: חברו Vercel Blob לפרויקט (משתנה BLOB_READ_WRITE_TOKEN) כדי לשמור שינויים.",
    );
  }
}

function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

type Snapshot = { catalog: Catalog; etag: string | null };

async function readSnapshot(): Promise<Snapshot> {
  if (usingBlob()) {
    const res = await get(BLOB_PATHNAME, { access: "private", useCache: false });
    if (res && res.statusCode === 200) {
      const text = await new Response(res.stream).text();
      return { catalog: CatalogSchema.parse(JSON.parse(text)), etag: res.blob.etag };
    }
    return { catalog: CatalogSchema.parse(seed), etag: null };
  }

  try {
    const text = await fs.readFile(LOCAL_FILE, "utf8");
    return { catalog: CatalogSchema.parse(JSON.parse(text)), etag: null };
  } catch (error) {
    // Deployed without Blob: the bundled seed is the only copy we can read.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { catalog: CatalogSchema.parse(seed), etag: null };
    }
    throw error;
  }
}

async function writeSnapshot(catalog: Catalog, etag: string | null) {
  const body = JSON.stringify(CatalogSchema.parse(catalog), null, 2) + "\n";

  if (usingBlob()) {
    await put(BLOB_PATHNAME, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      // Refuse to overwrite a version someone else saved after we read it.
      ...(etag ? { ifMatch: etag } : {}),
    });
    return;
  }

  if (process.env.VERCEL) throw new StorageNotConfiguredError();
  await fs.writeFile(LOCAL_FILE, body, "utf8");
}

export async function readCatalog(): Promise<Catalog> {
  return (await readSnapshot()).catalog;
}

/**
 * Read-modify-write with optimistic concurrency. If another save lands between
 * our read and write, re-read and apply the change again (a few times).
 */
export async function updateCatalog<T>(
  change: (catalog: Catalog) => T,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { catalog, etag } = await readSnapshot();
    const draft = structuredClone(catalog);
    const result = change(draft);
    try {
      await writeSnapshot(draft, etag);
      return result;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) continue;
      throw error;
    }
  }
  throw new Error("הקטלוג עודכן במקביל כמה פעמים ברצף. נסו לשמור שוב.");
}
