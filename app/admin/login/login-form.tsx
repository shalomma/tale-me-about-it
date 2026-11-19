"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Button, Field, Input } from "@/components/admin/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="סיסמת ניהול">
        <Input type="password" name="password" required autoFocus autoComplete="current-password" dir="ltr" />
      </Field>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? "נכנסים…" : "כניסה"}
      </Button>
    </form>
  );
}
