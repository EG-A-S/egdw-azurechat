"use client";
import { FC, useEffect, useState } from "react";

const shownKey = (chatThreadId: string) => `ai-id-message-shown:${chatThreadId}`;

interface Props {
  chatThreadId: string;
  hasMessages: boolean;
}

// Client-only notice; intentionally never added to the chat store or persisted.
export const AiIdentificationMessage: FC<Props> = ({
  chatThreadId,
  hasMessages,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (hasMessages) return;
    if (sessionStorage.getItem(shownKey(chatThreadId)) === "true") return;
    sessionStorage.setItem(shownKey(chatThreadId), "true");
    setShow(true);
  }, [chatThreadId, hasMessages]);

  if (!show) return null;

  return (
    <div className="flex justify-center py-2">
      <p className="max-w-2xl rounded-md bg-muted px-4 py-2 text-center text-sm text-muted-foreground">
        You are chatting with an AI assistant powered by Azure OpenAI. Responses
        are generated automatically and may not always be accurate.
      </p>
    </div>
  );
};
