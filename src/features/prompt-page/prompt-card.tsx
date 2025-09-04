import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../ui/lib";
import { PromptModel } from "./models";
import { PromptCardContextMenu } from "./prompt-card-context-menu";

interface Props {
  prompt: PromptModel;
  showContextMenu: boolean;
  isUserAdmin: boolean;
  currentUserId: string;
}

export const PromptCard: FC<Props> = (props) => {
  const { prompt, isUserAdmin } = props;
  
  const borderStyle = prompt.isPublished ? "border-primary" : "border-destructive";
    
  return (
    <Card 
      key={prompt.id} 
      className={cn("flex flex-col", borderStyle)}
    >
      <CardHeader className="flex flex-row">
        <CardTitle className="flex-1">{prompt.name}</CardTitle>
        {props.showContextMenu && (
          <div>
            <PromptCardContextMenu prompt={prompt} currentUserId={props.currentUserId} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">
        {prompt.description.length > 100
          ? prompt.description.slice(0, 100).concat("...")
          : prompt.description}
      </CardContent>
    </Card>
  );
};
