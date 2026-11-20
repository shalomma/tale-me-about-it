import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { StorageNotConfiguredError } from "@/lib/catalog/store";

/**
 * Small JSON documents next to the catalog (agent settings, research chats).
 *
 * - Production (BLOB_READ_WRITE_TOKEN set): private files in Vercel Blob, at `pathname`.
 * - Local development: `data/<pathname>`.
 *
 * Unlike the catalog these are last-write-wins: each one is edited by one admin at a time.
 */
const LOCAL_ROOT = path.join(process.cwd(), "data");

function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localPath(pathname: string) {
  const full = path.join(LOCAL_ROOT, pathname);
  if (!full.startsWith(LOCAL_ROOT + path.sep)) throw new Error("invalid path");
  return full;
}

export async function readJson(pathname: string): Promise<unknown | null> {
  if (usingBlob()) {
    const res = await get(pathname, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    return JSON.parse(await new Response(res.stream).text());
  }
  try {
    return JSON.parse(await fs.readFile(localPath(pathname), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function writeJson(pathname: string, value: unknown): Promise<void> {
  const body = JSON.stringify(value, null, 2) + "\n";
  if (usingBlob()) {
    await put(pathname, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  if (process.env.VERCEL) throw new StorageNotConfiguredError();
  const file = localPath(pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}

export async function deleteJson(pathname: string): Promise<void> {
  if (usingBlob()) {
    await del(pathname);
    return;
  }
  await fs.rm(localPath(pathname), { force: true });
}
