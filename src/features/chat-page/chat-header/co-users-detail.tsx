import { Button } from "@/features/ui/button";
import { ScrollArea } from "@/features/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/features/ui/sheet";
import { Input } from "@/features/ui/input";
import { Plus, Trash } from "lucide-react";
import { Share2Icon } from "lucide-react";
import { ChangeEvent, FC, useState } from "react";
import { chatStore } from "../chat-store";

interface Props {
  chatThreadId: string;
  coUsers: Array<string>;
}

export const CoUsersDetail: FC<Props> = (props) => {
  const [inputEmailText, setInputEmailText] = useState('');
  const totalCount = props.coUsers?.length ?? 0;

  const handleChange = (event : ChangeEvent<HTMLInputElement>) => {
    setInputEmailText(event.target.value);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} className="gap-2" aria-label="Co Users Menu">
          <Share2Icon size={16} /> {totalCount}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[480px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Sharing conversation</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
        <form className="flex-1 flex flex-col">
          <div className="flex flex-col gap-4 bg-foreground/[0.02] border p-4 rounded-md">
            <div className="flex justify-between items-center gap-2 ">
              <SheetTitle>Users</SheetTitle>
              <Button
                type="button"
                className="flex gap-2"
                variant={"outline"}
                onClick={() => {
                  if(inputEmailText) {
                    chatStore.AddUserToChatThread(inputEmailText);
                    setInputEmailText("");
                  }
                }
              }
            >
            <Plus size={18} />Add
            </Button>
            </div>
          <Input placeholder="xxxxx@eg.dk" value={inputEmailText} onChange={handleChange}></Input>
          </div>
          </form>
          <br />
          <div className="pb-6 px-6 flex gap-4 flex-col  flex-1">
            {props.coUsers.map((coUser) => {
              return (
                <div
                  className="flex gap-2 p-4 items-center justify-between border rounded-md"
                  key={coUser}
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div>{coUser}</div>
                  </div>
                  <div>
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    type="button"
                   onClick={() => 
                     chatStore.RemoveUserFromChatThread(coUser)
                   }
                    aria-label="Remove this user"
                  >
                    <Trash size={18} />
                  </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};