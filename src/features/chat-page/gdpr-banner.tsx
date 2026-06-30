"use client";
import { cn } from "@/features/ui/lib";
import { AlertTriangle, X } from "lucide-react";
import { FC, useEffect, useState } from "react";

const dismissKey = (chatThreadId: string) => `gdpr-banner-dismissed:${chatThreadId}`;

interface Props {
  chatThreadId: string;
}

export const GdprBanner: FC<Props> = ({ chatThreadId }) => {
  // Start hidden to avoid flashing a banner the user already dismissed.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(dismissKey(chatThreadId)) === "true");
  }, [chatThreadId]);

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(dismissKey(chatThreadId), "true");
    setDismissed(true);
  };

  return (
    <div
      role="alert"
      className={cn(
        "sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-2",
        "border-amber-500/50 bg-amber-50 text-amber-900",
        "dark:bg-amber-950/40 dark:text-amber-200"
      )}
    >
      <AlertTriangle size={18} className="shrink-0" />
      <p className="flex-1 text-sm">
        Do not enter personal data (GDPR) in this chat. Conversations may be
        logged and are not suitable for sensitive information.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss GDPR disclaimer"
        className="shrink-0 rounded-md p-1 hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
      >
        <X size={18} />
      </button>
    </div>
  );
};
