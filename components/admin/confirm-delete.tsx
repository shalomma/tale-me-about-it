"use client";

import { useId, useRef, useState, useTransition } from "react";
import { Trash } from "lucide-react";
import { Button } from "./ui";

/**
 * A delete button that asks first, in a modal dialog. The confirm button opens in the
 * middle of the screen, away from the trigger, so a double-click can't delete by accident.
 */
export function ConfirmDelete({
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
  triggerVariant = "secondary",
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  /** Runs the delete. Resolves to an error message, or null when it worked. */
  onConfirm: () => Promise<string | null>;
  triggerVariant?: "secondary" | "ghost";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  function open() {
    setError(null);
    dialogRef.current?.showModal();
    // Start on the safe choice.
    cancelRef.current?.focus();
  }

  function confirm() {
    startTransition(async () => {
      const message = await onConfirm();
      if (message) setError(message);
      else dialogRef.current?.close();
    });
  }

  return (
    <>
      <Button variant={triggerVariant} onClick={open} className="text-red-700">
        <Trash className="size-4" aria-hidden />
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className="m-auto w-[min(28rem,calc(100dvw-2rem))] rounded-xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-xl backdrop:bg-zinc-950/40"
      >
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={`${id}-description`} className="mt-1 text-sm text-zinc-600">
          {description}
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} onClick={() => dialogRef.current?.close()} disabled={pending}>
            ביטול
          </Button>
          <Button variant="danger" onClick={confirm} disabled={pending}>
            <Trash className="size-4" aria-hidden />
            {pending ? "מוחק…" : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
