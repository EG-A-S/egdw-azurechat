"use client";

import { Copy, MoreVertical, Pencil, Share, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC, useState } from "react";
import { DropdownMenuItemWithIcon } from "../chat-page/chat-menu/chat-menu-item";
import { RevalidateCache } from "../common/navigation-helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LoadingIndicator } from "../ui/loading";
import { PromptModel } from "./models";
import { DeletePrompt, DuplicatePrompt, SharePrompt } from "./prompt-service";
import { promptStore } from "./prompt-store";

interface Props {
  prompt: PromptModel;
  currentUserId: string;
}

type DropdownAction = "delete" | "share" | "duplicate";

export const PromptCardContextMenu: FC<Props> = (props) => {
  const { data } = useSession();
  const { isLoading, handleAction, isOwner, canShare, canDuplicate } = useDropdownAction({
    prompt: props.prompt,
    currentUserId: props.currentUserId,
  });

  if (!isOwner && !canDuplicate) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          {isLoading ? (
            <LoadingIndicator isLoading={isLoading} />
          ) : (
            <MoreVertical size={18} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isOwner && (
            <DropdownMenuItemWithIcon
              onClick={() => promptStore.updatePrompt(props.prompt)}
            >
              <Pencil size={18} />
              <span>Edit</span>
            </DropdownMenuItemWithIcon>
          )}
          {canShare && (
            <DropdownMenuItemWithIcon
              onClick={async () => await handleAction("share")}
            >
              <Share size={18} />
              <span>Share</span>
            </DropdownMenuItemWithIcon>
          )}
          {canDuplicate && (
            <DropdownMenuItemWithIcon
              onClick={async () => await handleAction("duplicate")}
            >
              <Copy size={18} />
              <span>Duplicate</span>
            </DropdownMenuItemWithIcon>
          )}
          {isOwner && (
            <DropdownMenuItemWithIcon
              onClick={async () => await handleAction("delete")}
            >
              <Trash size={18} />
              <span>Delete</span>
            </DropdownMenuItemWithIcon>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const useDropdownAction = (props: { prompt: PromptModel; currentUserId: string }) => {
  const { prompt, currentUserId } = props;
  const { data } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = data?.user?.isAdmin || prompt.userId === currentUserId;
  const canShare = isOwner && prompt.isPublished;
  const canDuplicate = !isOwner && prompt.sharedWith?.includes(data?.user?.email || "");

  const handleAction = async (action: DropdownAction) => {
    setIsLoading(true);
    switch (action) {
      case "delete":
        if (window.confirm(`Are you sure you want to delete ${prompt.name}?`)) {
          await DeletePrompt(prompt.id);
          RevalidateCache({
            page: "prompt",
          });
        }
        break;
      case "share":
        const emails = window.prompt("Enter email addresses to share with (separated by commas):\nFormat: xxxxx@eg.dk");
        if (emails) {
          const emailList = emails.split(',').map(e => e.trim()).filter(e => e.length > 0);
          const result = await SharePrompt(prompt.id, emailList);
          if (result.status === "OK") {
            alert("Prompt shared successfully!");
          } else {
            alert(`Error sharing prompt: ${result.errors?.[0]?.message || 'Unknown error'}`);
          }
        }
        break;
      case "duplicate":
        if (window.confirm(`Are you sure you want to duplicate "${prompt.name}"?`)) {
          const result = await DuplicatePrompt(prompt.id);
          if (result.status === "OK") {
            alert("Prompt duplicated successfully!");
            RevalidateCache({
              page: "prompt",
            });
          } else {
            alert(`Error duplicating prompt: ${result.errors?.[0]?.message || 'Unknown error'}`);
          }
        }
        break;
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    handleAction,
    isOwner,
    canShare,
    canDuplicate,
  };
};
