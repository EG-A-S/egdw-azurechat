import { ToastAction } from "@radix-ui/react-toast";
import { toast } from "../ui/use-toast";

interface MessageProp {
  title: string;
  description: string;
}

export const showError = (error: string, reload?: () => void) => {
  const formattedError = error.split('\n').map((line, index) => (
    <div key={index}>{line}</div>
  ));

  toast({
    variant: "destructive",
    description: <div>{formattedError}</div>,
    action: reload ? (
      <ToastAction
        altText="Try again"
        onClick={() => {
          reload();
        }}
      >
        Try again
      </ToastAction>
    ) : undefined,
  });
};
export const showSuccess = (message: MessageProp) => {
  toast(message);
};
