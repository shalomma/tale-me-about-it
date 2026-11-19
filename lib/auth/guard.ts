import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "./session";

export async function isAdmin(): Promise<boolean> {
  // Session expiry depends on the current time, so this must run per request.
  await connection();
  const jar = await cookies();
  return verifySessionValue(jar.get(SESSION_COOKIE)?.value);
}

/**
 * Call at the top of every admin page, Server Action and Route Handler.
 * The proxy is only a fast first check; this is the real gate.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
