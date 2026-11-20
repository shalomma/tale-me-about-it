"use client";

import { useActionState, useState } from "react";
import { login } from "../actions";
import { Button, Field, Input } from "@/components/admin/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="סיסמת ניהול">
        <Input
          type={showPassword ? "text" : "password"}
          id="current-password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          enterKeyHint="go"
          dir="ltr"
        />
      </Field>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="size-4 accent-violet-600"
        />
        הצגת הסיסמה
      </label>
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
